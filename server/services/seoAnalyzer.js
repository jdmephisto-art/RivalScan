const axios = require('axios');
const cheerio = require('cheerio');

class SeoAnalyzer {
  async analyze(url) {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      
      const response = await axios.get(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000,
        maxRedirects: 5
      });

      const html = response.data;
      const $ = cheerio.load(html);

      const analysis = {
        url: normalizedUrl,
        meta: this.analyzeMeta($),
        headings: this.analyzeHeadings($),
        images: this.analyzeImages($),
        links: this.analyzeLinks($, normalizedUrl),
        structuredData: this.analyzeStructuredData($),
        social: this.analyzeSocialTags($),
        score: 0,
        issues: []
      };

      // Calculate SEO score and identify issues
      const { score, issues } = this.calculateScore(analysis);
      analysis.score = score;
      analysis.issues = issues;

      return analysis;

    } catch (error) {
      console.error('SEO analysis error:', error.message);
      return {
        url,
        error: error.message,
        score: 0,
        issues: [{ severity: 'error', message: 'Failed to analyze page' }]
      };
    }
  }

  analyzeMeta($) {
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    const robots = $('meta[name="robots"]').attr('content') || '';
    const viewport = $('meta[name="viewport"]').attr('content') || '';
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '';
    const canonical = $('link[rel="canonical"]').attr('href') || '';

    return {
      title: {
        content: title,
        length: title.length,
        isOptimal: title.length >= 30 && title.length <= 60
      },
      description: {
        content: description,
        length: description.length,
        isOptimal: description.length >= 120 && description.length <= 160
      },
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      robots,
      viewport,
      charset,
      canonical
    };
  }

  analyzeHeadings($) {
    const headings = {};
    for (let i = 1; i <= 6; i++) {
      const elements = $(`h${i}`);
      headings[`h${i}`] = {
        count: elements.length,
        items: elements.map((_, el) => $(el).text().trim()).get()
      };
    }

    return {
      ...headings,
      hasH1: headings.h1.count > 0,
      multipleH1: headings.h1.count > 1,
      structure: this.analyzeHeadingStructure($)
    };
  }

  analyzeHeadingStructure($) {
    const structure = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      structure.push({
        level: parseInt(el.tagName[1]),
        text: $(el).text().trim().substring(0, 50)
      });
    });
    return structure;
  }

  analyzeImages($) {
    const images = $('img');
    const imageData = [];
    let missingAlt = 0;

    images.each((_, el) => {
      const src = $(el).attr('src') || '';
      const alt = $(el).attr('alt') || '';
      const width = $(el).attr('width') || '';
      const height = $(el).attr('height') || '';

      if (!alt && !src.includes('data:image')) {
        missingAlt++;
      }

      imageData.push({ src: src.substring(0, 100), alt: alt.substring(0, 50), width, height });
    });

    return {
      total: images.length,
      missingAlt,
      hasDimensions: images.filter((_, el) => $(el).attr('width') && $(el).attr('height')).length,
      images: imageData.slice(0, 10)
    };
  }

  analyzeLinks($, baseUrl) {
    const links = $('a[href]');
    const internalLinks = [];
    const externalLinks = [];
    const baseDomain = new URL(baseUrl).hostname;

    links.each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      const isExternal = href.startsWith('http') && !href.includes(baseDomain);
      const hasTitle = !!$(el).attr('title');

      const linkData = { href: href.substring(0, 100), text: text.substring(0, 50), hasTitle };

      if (isExternal) {
        externalLinks.push(linkData);
      } else if (href.startsWith('/') || href.startsWith('#') || href.includes(baseDomain)) {
        internalLinks.push(linkData);
      }
    });

    return {
      total: links.length,
      internal: internalLinks.length,
      external: externalLinks.length,
      internalLinks: internalLinks.slice(0, 10),
      externalLinks: externalLinks.slice(0, 10)
    };
  }

  analyzeStructuredData($) {
    const scripts = $('script[type="application/ld+json"]');
    const structuredData = [];

    scripts.each((_, el) => {
      try {
        const content = $(el).html();
        const data = JSON.parse(content);
        structuredData.push({
          type: data['@type'] || 'Unknown',
          data
        });
      } catch (e) {
        // Invalid JSON
      }
    });

    return {
      count: structuredData.length,
      types: structuredData.map(s => s.type),
      data: structuredData
    };
  }

  analyzeSocialTags($) {
    return {
      openGraph: {
        title: $('meta[property="og:title"]').attr('content') || '',
        description: $('meta[property="og:description"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || '',
        url: $('meta[property="og:url"]').attr('content') || '',
        type: $('meta[property="og:type"]').attr('content') || '',
        siteName: $('meta[property="og:site_name"]').attr('content') || ''
      },
      twitter: {
        card: $('meta[name="twitter:card"]').attr('content') || '',
        title: $('meta[name="twitter:title"]').attr('content') || '',
        description: $('meta[name="twitter:description"]').attr('content') || '',
        image: $('meta[name="twitter:image"]').attr('content') || '',
        site: $('meta[name="twitter:site"]').attr('content') || ''
      }
    };
  }

  calculateScore(analysis) {
    let score = 100;
    const issues = [];

    // Title checks
    if (!analysis.meta.title.content) {
      score -= 15;
      issues.push({ severity: 'critical', message: 'Missing title tag', category: 'meta' });
    } else if (analysis.meta.title.length < 30) {
      score -= 5;
      issues.push({ severity: 'warning', message: 'Title is too short (recommended: 30-60 chars)', category: 'meta' });
    } else if (analysis.meta.title.length > 60) {
      score -= 5;
      issues.push({ severity: 'warning', message: 'Title is too long (recommended: 30-60 chars)', category: 'meta' });
    }

    // Description checks
    if (!analysis.meta.description.content) {
      score -= 10;
      issues.push({ severity: 'critical', message: 'Missing meta description', category: 'meta' });
    } else if (analysis.meta.description.length < 120) {
      score -= 5;
      issues.push({ severity: 'warning', message: 'Description is too short (recommended: 120-160 chars)', category: 'meta' });
    } else if (analysis.meta.description.length > 160) {
      score -= 5;
      issues.push({ severity: 'warning', message: 'Description is too long (recommended: 120-160 chars)', category: 'meta' });
    }

    // Heading checks
    if (!analysis.headings.hasH1) {
      score -= 10;
      issues.push({ severity: 'critical', message: 'Missing H1 tag', category: 'headings' });
    } else if (analysis.headings.multipleH1) {
      score -= 5;
      issues.push({ severity: 'warning', message: 'Multiple H1 tags found (should be only one)', category: 'headings' });
    }

    // Image checks
    if (analysis.images.missingAlt > 0) {
      score -= Math.min(10, analysis.images.missingAlt * 2);
      issues.push({ 
        severity: 'warning', 
        message: `${analysis.images.missingAlt} images missing alt text`, 
        category: 'images' 
      });
    }

    // Social tags
    if (!analysis.social.openGraph.title) {
      score -= 5;
      issues.push({ severity: 'info', message: 'Missing Open Graph tags', category: 'social' });
    }

    if (!analysis.social.twitter.card) {
      score -= 3;
      issues.push({ severity: 'info', message: 'Missing Twitter Card tags', category: 'social' });
    }

    // Viewport
    if (!analysis.meta.viewport) {
      score -= 5;
      issues.push({ severity: 'warning', message: 'Missing viewport meta tag (not mobile-friendly)', category: 'meta' });
    }

    return { score: Math.max(0, score), issues };
  }

  normalizeUrl(url) {
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  }
}

module.exports = SeoAnalyzer;

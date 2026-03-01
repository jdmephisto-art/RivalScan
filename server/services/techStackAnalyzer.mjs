import axios from 'axios';
import * as cheerio from 'cheerio';

// Tech patterns for detection
const techPatterns = {
  // Frameworks & Libraries
  'React': [
    { type: 'selector', pattern: '[data-reactroot], [data-reactid]' },
    { type: 'script', pattern: /react(?:\.min)?\.js/i },
    { type: 'global', pattern: 'React' }
  ],
  'Vue.js': [
    { type: 'selector', pattern: '[data-v-]' },
    { type: 'script', pattern: /vue(?:\.min)?\.js/i },
    { type: 'global', pattern: 'Vue' }
  ],
  'Angular': [
    { type: 'selector', pattern: '[ng-app], [ng-controller]' },
    { type: 'script', pattern: /angular(?:\.min)?\.js/i }
  ],
  'Next.js': [
    { type: 'meta', pattern: 'next-head' },
    { type: 'script', pattern: /_next\/static/i }
  ],
  'Nuxt.js': [
    { type: 'meta', pattern: 'nuxt' },
    { type: 'id', pattern: '__nuxt' }
  ],
  'Svelte': [
    { type: 'script', pattern: /svelte/i }
  ],

  // CSS Frameworks
  'Tailwind CSS': [
    { type: 'class', pattern: /\btw-|\btailwind/i },
    { type: 'script', pattern: /tailwindcss/i }
  ],
  'Bootstrap': [
    { type: 'class', pattern: /\bbtn\b|\bcontainer\b|\brow\b|\bcol-/i },
    { type: 'script', pattern: /bootstrap(?:\.min)?\.(?:css|js)/i }
  ],
  'Material UI': [
    { type: 'class', pattern: /Mui[A-Z]/ }
  ],

  // Analytics & Marketing
  'Google Analytics': [
    { type: 'script', pattern: /google-analytics\.com|googletagmanager\.com|gtag/i },
    { type: 'global', pattern: 'gtag' }
  ],
  'Google Tag Manager': [
    { type: 'script', pattern: /googletagmanager\.com\/gtm\.js/i }
  ],
  'Mixpanel': [
    { type: 'script', pattern: /mixpanel/i },
    { type: 'global', pattern: 'mixpanel' }
  ],
  'Segment': [
    { type: 'script', pattern: /segment\.com|segment\.io/i },
    { type: 'global', pattern: 'analytics' }
  ],
  'Hotjar': [
    { type: 'script', pattern: /hotjar/i },
    { type: 'global', pattern: 'hj' }
  ],
  'Intercom': [
    { type: 'script', pattern: /intercom/i },
    { type: 'global', pattern: 'Intercom' }
  ],
  'Crisp': [
    { type: 'script', pattern: /crisp\.chat/i },
    { type: 'global', pattern: '$crisp' }
  ],
  'Drift': [
    { type: 'script', pattern: /drift\.com/i },
    { type: 'global', pattern: 'drift' }
  ],

  // Payment
  'Stripe': [
    { type: 'script', pattern: /stripe\.com|stripe\.js/i },
    { type: 'global', pattern: 'Stripe' }
  ],
  'PayPal': [
    { type: 'script', pattern: /paypal\.com|paypalobjects\.com/i },
    { type: 'global', pattern: 'paypal' }
  ],

  // Hosting & CDN
  'Vercel': [
    { type: 'header', pattern: /vercel/i },
    { type: 'server', pattern: /vercel/i }
  ],
  'Netlify': [
    { type: 'header', pattern: /netlify/i },
    { type: 'server', pattern: /netlify/i }
  ],
  'Cloudflare': [
    { type: 'header', pattern: /cloudflare/i },
    { type: 'server', pattern: /cloudflare/i }
  ],
  'AWS': [
    { type: 'header', pattern: /amazon|aws/i },
    { type: 'server', pattern: /amazon|aws/i }
  ],

  // CMS
  'WordPress': [
    { type: 'meta', pattern: /wordpress/i },
    { type: 'link', pattern: /wp-content|wp-includes/i }
  ],
  'Webflow': [
    { type: 'meta', pattern: /webflow/i },
    { type: 'script', pattern: /webflow/i }
  ],
  'Shopify': [
    { type: 'meta', pattern: /shopify/i },
    { type: 'script', pattern: /shopify/i }
  ],

  // Other Tools
  'jQuery': [
    { type: 'script', pattern: /jquery(?:\.min)?\.js/i },
    { type: 'global', pattern: 'jQuery' }
  ],
  'GSAP': [
    { type: 'script', pattern: /gsap/i },
    { type: 'global', pattern: 'gsap' }
  ],
  'Auth0': [
    { type: 'script', pattern: /auth0/i },
    { type: 'global', pattern: 'auth0' }
  ],
  'Firebase': [
    { type: 'script', pattern: /firebase/i },
    { type: 'global', pattern: 'firebase' }
  ]
};

class TechStackAnalyzer {
  async analyze(url) {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      
      if (!normalizedUrl) {
        return {
          url,
          technologies: [],
          categorized: {},
          totalCount: 0,
          error: 'Invalid URL format'
        };
      }
      
      // Fetch the page
      const response = await axios.get(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000,
        maxRedirects: 5
      });

      const html = response.data;
      const $ = cheerio.load(html);
      const headers = response.headers;

      const detectedTech = [];

      for (const [tech, patterns] of Object.entries(techPatterns)) {
        let isDetected = false;

        for (const pattern of patterns) {
          if (isDetected) break;

          switch (pattern.type) {
            case 'selector':
              if ($(pattern.pattern).length > 0) {
                isDetected = true;
              }
              break;

            case 'script':
              const scripts = $('script[src]').map((_, el) => $(el).attr('src')).get().join(' ');
              const inlineScripts = $('script').map((_, el) => $(el).html()).get().join(' ');
              const scriptPattern = pattern.pattern instanceof RegExp ? pattern.pattern : new RegExp(pattern.pattern, 'i');
              if (scriptPattern.test(scripts) || scriptPattern.test(inlineScripts)) {
                isDetected = true;
              }
              break;

            case 'meta':
              const metaContent = $('meta').map((_, el) => $(el).attr('content') || '').get().join(' ');
              const metaPattern = pattern.pattern instanceof RegExp ? pattern.pattern : new RegExp(pattern.pattern, 'i');
              if (metaPattern.test(metaContent)) {
                isDetected = true;
              }
            break;

            case 'class':
              const allClasses = $('*[class]').map((_, el) => $(el).attr('class')).get().join(' ');
              const classPattern = pattern.pattern instanceof RegExp ? pattern.pattern : new RegExp(pattern.pattern, 'i');
              if (classPattern.test(allClasses)) {
                isDetected = true;
              }
              break;

            case 'id':
              if ($(`#${pattern.pattern}`).length > 0) {
                isDetected = true;
              }
              break;

            case 'header':
              const headerStr = JSON.stringify(headers);
              const headerPattern = pattern.pattern instanceof RegExp ? pattern.pattern : new RegExp(pattern.pattern, 'i');
              if (headerPattern.test(headerStr)) {
                isDetected = true;
              }
            break;

            case 'server':
              const server = headers.server || '';
              const serverPattern = pattern.pattern instanceof RegExp ? pattern.pattern : new RegExp(pattern.pattern, 'i');
              if (serverPattern.test(server)) {
                isDetected = true;
              }
              break;

            case 'link':
              const links = $('link[href]').map((_, el) => $(el).attr('href')).get().join(' ');
              const linkPattern = pattern.pattern instanceof RegExp ? pattern.pattern : new RegExp(pattern.pattern, 'i');
              if (linkPattern.test(links)) {
                isDetected = true;
              }
              break;
          }
        }

        if (isDetected) {
          detectedTech.push(tech);
        }
      }

      // Categorize technologies
      const categories = {
        'Framework': ['React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte'],
        'Styling': ['Tailwind CSS', 'Bootstrap', 'Material UI'],
        'Analytics': ['Google Analytics', 'Google Tag Manager', 'Mixpanel', 'Segment', 'Hotjar'],
        'Communication': ['Intercom', 'Crisp', 'Drift'],
        'Payment': ['Stripe', 'PayPal'],
        'Hosting': ['Vercel', 'Netlify', 'Cloudflare', 'AWS'],
        'CMS': ['WordPress', 'Webflow', 'Shopify'],
        'Utilities': ['jQuery', 'GSAP', 'Auth0', 'Firebase']
      };

      const categorized = {};
      detectedTech.forEach(tech => {
        for (const [category, items] of Object.entries(categories)) {
          if (items.includes(tech)) {
            if (!categorized[category]) categorized[category] = [];
            categorized[category].push(tech);
            break;
          }
        }
      });

      return {
        url: normalizedUrl,
        technologies: detectedTech,
        categorized,
        totalCount: detectedTech.length
      };

    } catch (error) {
      console.error('Tech stack analysis error:', error.message);
      return {
        url,
        technologies: [],
        categorized: {},
        totalCount: 0,
        error: error.message
      };
    }
  }

  normalizeUrl(url) {
    if (!url) return null;
    
    let normalized = url.trim();
    
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    
    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    
    // Validate URL
    try {
      const urlObj = new URL(normalized);
      if (!urlObj.hostname) return null;
      return normalized;
    } catch {
      return null;
    }
  }
}

export default TechStackAnalyzer;

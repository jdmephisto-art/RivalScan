import axios from 'axios';

class PerformanceAnalyzer {
  constructor() {
    // Бесплатный API ключ Google (можно использовать без ключа, но с лимитами)
    // Для продакшена получите ключ: https://developers.google.com/speed/docs/insights/v5/get-started
    this.apiKey = process.env.PAGESPEED_API_KEY || '';
  }

  async analyze(url) {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      
      if (!normalizedUrl) {
        return {
          url,
          scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
          timing: {},
          diagnostics: {},
          opportunities: [],
          error: 'Invalid URL format'
        };
      }

      console.log('Analyzing performance via API:', normalizedUrl);

      // Формируем URL для API
      const apiUrl = this.apiKey 
        ? `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&key=${this.apiKey}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`
        : `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`;

      const response = await axios.get(apiUrl, {
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RivalScan/1.0)'
        }
      });

      const data = response.data;
      const lighthouse = data.lighthouseResult;
      const categories = lighthouse.categories;
      const audits = lighthouse.audits;

      // Извлекаем метрики
      const metrics = {
        url: normalizedUrl,
        scores: {
          performance: Math.round((categories.performance?.score || 0) * 100),
          accessibility: Math.round((categories.accessibility?.score || 0) * 100),
          bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
          seo: Math.round((categories.seo?.score || 0) * 100)
        },
        timing: {
          firstContentfulPaint: this.formatTime(audits['first-contentful-paint']?.numericValue),
          largestContentfulPaint: this.formatTime(audits['largest-contentful-paint']?.numericValue),
          timeToInteractive: this.formatTime(audits['interactive']?.numericValue),
          speedIndex: this.formatTime(audits['speed-index']?.numericValue),
          totalBlockingTime: this.formatTime(audits['total-blocking-time']?.numericValue),
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue?.toFixed(3) || '0'
        },
        diagnostics: {
          serverResponseTime: this.formatTime(audits['server-response-time']?.numericValue),
          renderBlockingResources: audits['render-blocking-resources']?.details?.items?.length || 0,
          unusedJavascript: this.formatBytes(audits['unused-javascript']?.details?.overallSavingsBytes || 0),
          unusedCss: this.formatBytes(audits['unused-css-rules']?.details?.overallSavingsBytes || 0),
          imageOptimization: this.formatBytes(audits['uses-optimized-images']?.details?.overallSavingsBytes || 0)
        },
        opportunities: this.extractOpportunities(audits)
      };

      console.log('Performance analysis completed:', metrics.scores);
      return metrics;

    } catch (error) {
      console.error('Performance analysis error:', error.message);
      
      return {
        url,
        scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
        timing: {},
        diagnostics: {},
        opportunities: [],
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  extractOpportunities(audits) {
    const opportunities = [];
    const opportunityAudits = [
      'render-blocking-resources',
      'unused-javascript',
      'unused-css-rules',
      'uses-optimized-images',
      'uses-responsive-images',
      'efficiently-encode-images',
      'enable-text-compression',
      'uses-text-compression',
      'minify-javascript',
      'minify-css'
    ];

    opportunityAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score !== null && audit.score < 1 && audit.details?.overallSavingsMs > 0) {
        opportunities.push({
          title: audit.title,
          savings: this.formatTime(audit.details.overallSavingsMs),
          savingsBytes: this.formatBytes(audit.details.overallSavingsBytes || 0)
        });
      }
    });

    return opportunities.sort((a, b) => {
      const aMs = parseFloat(a.savings);
      const bMs = parseFloat(b.savings);
      return bMs - aMs;
    }).slice(0, 5);
  }

  formatTime(ms) {
    if (!ms || ms < 0) return '0ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  formatBytes(bytes) {
    if (!bytes || bytes < 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  normalizeUrl(url) {
    if (!url) return null;
    
    let normalized = url.trim();
    normalized = normalized.replace(/\/$/, '');
    
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    
    try {
      const urlObj = new URL(normalized);
      if (!urlObj.hostname) return null;
      return normalized;
    } catch {
      return null;
    }
  }
}

export default PerformanceAnalyzer;

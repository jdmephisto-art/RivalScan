import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

class PerformanceAnalyzer {
  async analyze(url) {
    let browser = null;
    
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
      
      // Launch browser
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      console.log('Chrome path:', executablePath);
      
      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: executablePath || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      // Run Lighthouse audit
      const result = await lighthouse(normalizedUrl, {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 562.5,
          downloadThroughputKbps: 1474.5600000000002,
          uploadThroughputKbps: 675
        }
      });

      const lhr = result.lhr;

      // Extract key metrics
      const metrics = {
        url: normalizedUrl,
        scores: {
          performance: Math.round(lhr.categories.performance.score * 100),
          accessibility: Math.round(lhr.categories.accessibility.score * 100),
          bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
          seo: Math.round(lhr.categories.seo.score * 100)
        },
        timing: {
          firstContentfulPaint: this.formatTime(lhr.audits['first-contentful-paint'].numericValue),
          largestContentfulPaint: this.formatTime(lhr.audits['largest-contentful-paint'].numericValue),
          timeToInteractive: this.formatTime(lhr.audits['interactive'].numericValue),
          speedIndex: this.formatTime(lhr.audits['speed-index'].numericValue),
          totalBlockingTime: this.formatTime(lhr.audits['total-blocking-time'].numericValue),
          cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue?.toFixed(3) || '0'
        },
        diagnostics: {
          serverResponseTime: this.formatTime(lhr.audits['server-response-time'].numericValue),
          renderBlockingResources: lhr.audits['render-blocking-resources'].details?.items?.length || 0,
          unusedJavascript: this.formatBytes(lhr.audits['unused-javascript'].details?.overallSavingsBytes || 0),
          unusedCss: this.formatBytes(lhr.audits['unused-css-rules'].details?.overallSavingsBytes || 0),
          imageOptimization: this.formatBytes(lhr.audits['uses-optimized-images'].details?.overallSavingsBytes || 0)
        },
        opportunities: this.extractOpportunities(lhr)
      };

      await browser.close();
      return metrics;

    } catch (error) {
      if (browser) await browser.close();
      console.error('Performance analysis error:', error.message);
      
      // Return fallback data if Lighthouse fails
      return {
        url,
        scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
        timing: {},
        diagnostics: {},
        opportunities: [],
        error: error.message
      };
    }
  }

  extractOpportunities(lhr) {
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
      const audit = lhr.audits[auditId];
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

export default PerformanceAnalyzer;

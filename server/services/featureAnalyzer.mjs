import axios from 'axios';
import * as cheerio from 'cheerio';

class FeatureAnalyzer {
  constructor() {
    // Feature patterns to detect
    this.featurePatterns = {
      // Communication features
      'Live Chat': {
        selectors: [
          '.chat-widget', '.live-chat', '#chat-widget',
          '[class*="chat"]', '[id*="chat"]',
          '.intercom-lightweight-app', '.crisp-client',
          '.drift-frame-controller', '.zendesk-web-widget'
        ],
        scripts: [/intercom/i, /crisp/i, /drift/i, /zendesk/i, /livechat/i, /tawk/i]
      },

      // Forms & CTAs
      'Contact Form': {
        selectors: [
          'form[action*="contact"]', '.contact-form',
          'input[type="email"]', 'textarea[name*="message"]'
        ]
      },
      'Newsletter Signup': {
        selectors: [
          'form[action*="newsletter"]', 'form[action*="subscribe"]',
          'input[name*="email"]', '.newsletter-form',
          '[class*="newsletter"]', '[class*="subscribe"]'
        ]
      },
      'Free Trial CTA': {
        selectors: [
          'a:contains("Free Trial")', 'a:contains("Start Free")',
          'button:contains("Free Trial")', 'button:contains("Try Free")',
          '[class*="trial"]', '[class*="free-trial"]'
        ],
        text: [/free trial/i, /start free/i, /try free/i, /try it free/i]
      },
      'Demo Booking': {
        selectors: [
          'a:contains("Demo")', 'a:contains("Book a Demo")',
          'button:contains("Demo")', '[class*="demo"]'
        ],
        text: [/book a demo/i, /schedule demo/i, /request demo/i]
      },

      // Content features
      'Testimonials': {
        selectors: [
          '.testimonial', '.testimonials', '[class*="testimonial"]',
          '.review', '.reviews', '[class*="review"]',
          '.quote', '.quotes'
        ],
        text: [/testimonial/i, /what our customers say/i, /customer reviews/i]
      },
      'Case Studies': {
        selectors: [
          'a[href*="case-study"]', 'a[href*="case-study"]',
          '[class*="case-study"]', '[class*="casestudy"]'
        ],
        text: [/case study/i, /case studies/i, /success story/i]
      },
      'Blog': {
        selectors: [
          'a[href*="/blog"]', 'a[href*="/articles"]',
          '[class*="blog-post"]', '[class*="article"]'
        ]
      },
      'FAQ Section': {
        selectors: [
          '.faq', '.faqs', '[class*="faq"]',
          '[id*="faq"]', 'details', 'summary'
        ],
        text: [/frequently asked questions/i, /faq/i]
      },

      // Trust signals
      'Social Proof': {
        selectors: [
          '.social-proof', '[class*="social-proof"]',
          '.trust-badge', '.trust-badges',
          '.customer-logos', '.logo-cloud'
        ],
        text: [/trusted by/i, /used by/i, /join \d+/i, /\d+ customers/i]
      },
      'Security Badges': {
        selectors: [
          '.security-badge', '.trust-badge',
          'img[alt*="SSL"]', 'img[alt*="secure"]',
          '[class*="secure"]', '[class*="security"]'
        ]
      },
      'Money Back Guarantee': {
        text: [/money back/i, /30-day guarantee/i, /refund policy/i]
      },

      // Product features
      'Pricing Table': {
        selectors: [
          '.pricing', '.pricing-table', '[class*="pricing"]',
          '.plan', '.plans', '.tier', '.tiers'
        ],
        text: [/pricing/i, /plans?/i, /choose your plan/i]
      },
      'Feature Comparison': {
        selectors: [
          '.comparison', '.compare-table', '[class*="comparison"]',
          '.feature-table', '.feature-list'
        ]
      },
      'Product Tour': {
        selectors: [
          '.tour', '.product-tour', '[class*="tour"]',
          '.walkthrough', '.onboarding'
        ],
        text: [/take a tour/i, /product tour/i, /see how it works/i]
      },
      'Screenshot Gallery': {
        selectors: [
          '.gallery', '.screenshots', '[class*="gallery"]',
          '.carousel', '.slider', '.swiper'
        ]
      },
      'Video Content': {
        selectors: [
          'video', 'iframe[src*="youtube"]', 'iframe[src*="vimeo"]',
          '.video-player', '[class*="video"]'
        ]
      },

      // E-commerce
      'Shopping Cart': {
        selectors: [
          '.cart', '.shopping-cart', '[class*="cart"]',
          '.basket', '[class*="basket"]'
        ]
      },
      'User Login': {
        selectors: [
          'a[href*="login"]', 'a[href*="signin"]',
          'button:contains("Login")', 'button:contains("Sign In")',
          '.login-form', '[class*="login"]'
        ]
      },
      'User Signup': {
        selectors: [
          'a[href*="signup"]', 'a[href*="register"]',
          'button:contains("Sign Up")', 'button:contains("Get Started")',
          '.signup-form', '[class*="signup"]'
        ]
      },

      // Navigation
      'Search Function': {
        selectors: [
          'input[type="search"]', '.search-form',
          '[class*="search"]', 'button[aria-label*="search"]'
        ]
      },
      'Sticky Navigation': {
        selectors: [
          'header.sticky', 'nav.sticky', '[class*="sticky"]',
          'header.fixed', 'nav.fixed', '[class*="fixed-header"]'
        ]
      },
      'Mobile Menu': {
        selectors: [
          '.mobile-menu', '.hamburger', '.menu-toggle',
          '[class*="hamburger"]', '[class*="mobile-nav"]'
        ]
      },

      // Engagement
      'Exit Intent Popup': {
        scripts: [/exit.intent/i, /exit-intent/i, /ouibounce/i, /exitpopup/i]
      },
      'Cookie Consent': {
        selectors: [
          '.cookie-banner', '.cookie-consent', '[class*="cookie"]',
          '.gdpr-banner', '[class*="gdpr"]'
        ],
        scripts: [/cookieconsent/i, /cookie-banner/i, /gdpr/i]
      },
      'Social Sharing': {
        selectors: [
          '.social-share', '.share-buttons', '[class*="social-share"]',
          'a[href*="twitter.com/share"]', 'a[href*="facebook.com/sharer"]'
        ]
      }
    };
  }

  async analyze(url) {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      
      if (!normalizedUrl) {
        return {
          url,
          detectedFeatures: [],
          missingFeatures: [],
          categorized: {},
          totalDetected: 0,
          recommendations: [],
          error: 'Invalid URL format'
        };
      }
      
      const response = await axios.get(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000,
        maxRedirects: 5
      });

      const html = response.data;
      const $ = cheerio.load(html);
      const scripts = $('script[src]').map((_, el) => $(el).attr('src')).get().join(' ');
      const pageText = $('body').text();

      const detectedFeatures = [];
      const missingFeatures = [];

      for (const [feature, patterns] of Object.entries(this.featurePatterns)) {
        let isDetected = false;

        // Check selectors
        if (patterns.selectors) {
          for (const selector of patterns.selectors) {
            try {
              if ($(selector).length > 0) {
                isDetected = true;
                break;
              }
            } catch (e) {
              // Invalid selector, skip
            }
          }
        }

        // Check scripts
        if (!isDetected && patterns.scripts) {
          for (const pattern of patterns.scripts) {
            if (pattern.test(scripts) || pattern.test(html)) {
              isDetected = true;
              break;
            }
          }
        }

        // Check text content
        if (!isDetected && patterns.text) {
          for (const pattern of patterns.text) {
            if (pattern.test(pageText)) {
              isDetected = true;
              break;
            }
          }
        }

        if (isDetected) {
          detectedFeatures.push(feature);
        } else {
          // Only add commonly expected features to "missing" list
          const importantFeatures = [
            'Live Chat', 'Testimonials', 'Free Trial CTA', 
            'Pricing Table', 'Social Proof', 'FAQ Section'
          ];
          if (importantFeatures.includes(feature)) {
            missingFeatures.push(feature);
          }
        }
      }

      // Categorize features
      const categories = {
        'Communication': ['Live Chat', 'Contact Form', 'Newsletter Signup'],
        'Conversion': ['Free Trial CTA', 'Demo Booking', 'Pricing Table', 'User Signup'],
        'Trust': ['Testimonials', 'Case Studies', 'Social Proof', 'Security Badges', 'Money Back Guarantee'],
        'Content': ['Blog', 'FAQ Section', 'Product Tour', 'Video Content'],
        'Functionality': ['Search Function', 'User Login', 'Shopping Cart', 'Mobile Menu']
      };

      const categorized = {};
      detectedFeatures.forEach(feature => {
        for (const [category, items] of Object.entries(categories)) {
          if (items.includes(feature)) {
            if (!categorized[category]) categorized[category] = [];
            categorized[category].push(feature);
            break;
          }
        }
      });

      return {
        url: normalizedUrl,
        detectedFeatures,
        missingFeatures: missingFeatures.slice(0, 5),
        categorized,
        totalDetected: detectedFeatures.length,
        recommendations: this.generateRecommendations(detectedFeatures, missingFeatures)
      };

    } catch (error) {
      console.error('Feature analysis error:', error.message);
      return {
        url,
        detectedFeatures: [],
        missingFeatures: [],
        categorized: {},
        totalDetected: 0,
        error: error.message
      };
    }
  }

  generateRecommendations(detected, missing) {
    const recommendations = [];

    const priorityMap = {
      'Social Proof': 'high',
      'Testimonials': 'high',
      'Free Trial CTA': 'high',
      'Live Chat': 'medium',
      'FAQ Section': 'medium',
      'Case Studies': 'medium',
      'Pricing Table': 'high',
      'Demo Booking': 'medium'
    };

    missing.forEach(feature => {
      if (priorityMap[feature]) {
        recommendations.push({
          feature,
          priority: priorityMap[feature],
          reason: this.getRecommendationReason(feature)
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  getRecommendationReason(feature) {
    const reasons = {
      'Social Proof': 'Builds trust and credibility with potential customers',
      'Testimonials': 'Customer reviews increase conversion rates significantly',
      'Free Trial CTA': 'Reduces friction for new user acquisition',
      'Live Chat': 'Improves customer support and reduces bounce rate',
      'FAQ Section': 'Addresses common objections and reduces support tickets',
      'Case Studies': 'Demonstrates real-world value and ROI',
      'Pricing Table': 'Transparent pricing builds trust and helps decision-making',
      'Demo Booking': 'Allows prospects to experience the product'
    };
    return reasons[feature] || 'Consider adding this feature to improve conversions';
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

export default FeatureAnalyzer;

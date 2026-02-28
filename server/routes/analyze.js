const express = require('express');
const router = express.Router();

const TechStackAnalyzer = require('../services/techStackAnalyzer');
const PerformanceAnalyzer = require('../services/performanceAnalyzer');
const SeoAnalyzer = require('../services/seoAnalyzer');
const FeatureAnalyzer = require('../services/featureAnalyzer');

const techAnalyzer = new TechStackAnalyzer();
const perfAnalyzer = new PerformanceAnalyzer();
const seoAnalyzer = new SeoAnalyzer();
const featureAnalyzer = new FeatureAnalyzer();

// Full analysis endpoint
router.post('/full', async (req, res) => {
  try {
    const { yourUrl, competitorUrl } = req.body;

    if (!yourUrl || !competitorUrl) {
      return res.status(400).json({
        error: 'Both yourUrl and competitorUrl are required'
      });
    }

    console.log(`Starting analysis: ${yourUrl} vs ${competitorUrl}`);

    // Run analyses in parallel
    const [yourTech, competitorTech, yourPerf, competitorPerf, yourSeo, competitorSeo, yourFeatures, competitorFeatures] = await Promise.all([
      techAnalyzer.analyze(yourUrl),
      techAnalyzer.analyze(competitorUrl),
      perfAnalyzer.analyze(yourUrl),
      perfAnalyzer.analyze(competitorUrl),
      seoAnalyzer.analyze(yourUrl),
      seoAnalyzer.analyze(competitorUrl),
      featureAnalyzer.analyze(yourUrl),
      featureAnalyzer.analyze(competitorUrl)
    ]);

    const result = {
      timestamp: new Date().toISOString(),
      yourSite: {
        url: yourUrl,
        tech: yourTech,
        performance: yourPerf,
        seo: yourSeo,
        features: yourFeatures
      },
      competitor: {
        url: competitorUrl,
        tech: competitorTech,
        performance: competitorPerf,
        seo: competitorSeo,
        features: competitorFeatures
      },
      comparison: generateComparison(yourTech, competitorTech, yourPerf, competitorPerf, yourSeo, competitorSeo, yourFeatures, competitorFeatures)
    };

    res.json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

// Individual analysis endpoints
router.post('/tech', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const result = await techAnalyzer.analyze(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/performance', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const result = await perfAnalyzer.analyze(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seo', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const result = await seoAnalyzer.analyze(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/features', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const result = await featureAnalyzer.analyze(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateComparison(yourTech, competitorTech, yourPerf, competitorPerf, yourSeo, competitorSeo, yourFeatures, competitorFeatures) {
  const comparison = {
    techStack: {
      winner: null,
      insights: []
    },
    performance: {
      winner: null,
      insights: []
    },
    seo: {
      winner: null,
      insights: []
    },
    features: {
      winner: null,
      insights: [],
      recommendations: []
    }
  };

  // Tech stack comparison
  if (yourTech.totalCount > 0 || competitorTech.totalCount > 0) {
    if (yourTech.totalCount > competitorTech.totalCount) {
      comparison.techStack.winner = 'you';
      comparison.techStack.insights.push(`You use ${yourTech.totalCount} technologies vs competitor's ${competitorTech.totalCount}`);
    } else if (competitorTech.totalCount > yourTech.totalCount) {
      comparison.techStack.winner = 'competitor';
      comparison.techStack.insights.push(`Competitor uses ${competitorTech.totalCount} technologies vs your ${yourTech.totalCount}`);
    } else {
      comparison.techStack.insights.push(`Both use similar number of technologies (${yourTech.totalCount})`);
    }

    // Find unique technologies
    const yourUnique = yourTech.technologies.filter(t => !competitorTech.technologies.includes(t));
    const competitorUnique = competitorTech.technologies.filter(t => !yourTech.technologies.includes(t));

    if (competitorUnique.length > 0) {
      comparison.techStack.insights.push(`Competitor uses: ${competitorUnique.slice(0, 5).join(', ')}`);
    }
    if (yourUnique.length > 0) {
      comparison.techStack.insights.push(`You uniquely use: ${yourUnique.slice(0, 5).join(', ')}`);
    }
  }

  // Performance comparison
  if (yourPerf.scores && competitorPerf.scores) {
    const yourScore = yourPerf.scores.performance;
    const competitorScore = competitorPerf.scores.performance;

    if (yourScore > competitorScore) {
      comparison.performance.winner = 'you';
      comparison.performance.insights.push(`Your performance score: ${yourScore} vs competitor: ${competitorScore}`);
    } else if (competitorScore > yourScore) {
      comparison.performance.winner = 'competitor';
      comparison.performance.insights.push(`Competitor performance score: ${competitorScore} vs yours: ${yourScore}`);
    } else {
      comparison.performance.insights.push(`Similar performance scores: ${yourScore}`);
    }

    // Load time comparison
    if (yourPerf.timing?.largestContentfulPaint && competitorPerf.timing?.largestContentfulPaint) {
      const yourLcp = parseFloat(yourPerf.timing.largestContentfulPaint);
      const competitorLcp = parseFloat(competitorPerf.timing.largestContentfulPaint);
      
      if (yourLcp < competitorLcp) {
        comparison.performance.insights.push(`Your LCP is faster: ${yourPerf.timing.largestContentfulPaint} vs ${competitorPerf.timing.largestContentfulPaint}`);
      } else {
        comparison.performance.insights.push(`Competitor LCP is faster: ${competitorPerf.timing.largestContentfulPaint} vs ${yourPerf.timing.largestContentfulPaint}`);
      }
    }
  }

  // SEO comparison
  if (yourSeo.score !== undefined && competitorSeo.score !== undefined) {
    if (yourSeo.score > competitorSeo.score) {
      comparison.seo.winner = 'you';
      comparison.seo.insights.push(`Your SEO score: ${yourSeo.score} vs competitor: ${competitorSeo.score}`);
    } else if (competitorSeo.score > yourSeo.score) {
      comparison.seo.winner = 'competitor';
      comparison.seo.insights.push(`Competitor SEO score: ${competitorSeo.score} vs yours: ${yourSeo.score}`);
    } else {
      comparison.seo.insights.push(`Similar SEO scores: ${yourSeo.score}`);
    }

    // Compare issues
    if (yourSeo.issues && competitorSeo.issues) {
      const yourCritical = yourSeo.issues.filter(i => i.severity === 'critical').length;
      const competitorCritical = competitorSeo.issues.filter(i => i.severity === 'critical').length;

      if (yourCritical < competitorCritical) {
        comparison.seo.insights.push(`You have fewer critical SEO issues (${yourCritical} vs ${competitorCritical})`);
      } else if (competitorCritical < yourCritical) {
        comparison.seo.insights.push(`Competitor has fewer critical SEO issues (${competitorCritical} vs ${yourCritical})`);
      }
    }
  }

  // Features comparison
  if (yourFeatures.totalDetected !== undefined && competitorFeatures.totalDetected !== undefined) {
    if (yourFeatures.totalDetected > competitorFeatures.totalDetected) {
      comparison.features.winner = 'you';
      comparison.features.insights.push(`You have ${yourFeatures.totalDetected} features vs competitor's ${competitorFeatures.totalDetected}`);
    } else if (competitorFeatures.totalDetected > yourFeatures.totalDetected) {
      comparison.features.winner = 'competitor';
      comparison.features.insights.push(`Competitor has ${competitorFeatures.totalDetected} features vs your ${yourFeatures.totalDetected}`);
    } else {
      comparison.features.insights.push(`Similar feature count: ${yourFeatures.totalDetected}`);
    }

    // Missing features recommendations
    if (competitorFeatures.detectedFeatures) {
      const yourMissing = competitorFeatures.detectedFeatures.filter(f => 
        !yourFeatures.detectedFeatures?.includes(f)
      );
      
      if (yourMissing.length > 0) {
        comparison.features.recommendations.push({
          type: 'missing',
          features: yourMissing.slice(0, 5),
          message: `Consider adding: ${yourMissing.slice(0, 3).join(', ')}`
        });
      }
    }

    // Add recommendations from feature analyzer
    if (yourFeatures.recommendations) {
      comparison.features.recommendations.push(...yourFeatures.recommendations.slice(0, 3));
    }
  }

  return comparison;
}

module.exports = router;

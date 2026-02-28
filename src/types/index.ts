export interface TechStackData {
  url: string;
  technologies: string[];
  categorized: Record<string, string[]>;
  totalCount: number;
  error?: string;
}

export interface PerformanceData {
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  timing: {
    firstContentfulPaint: string;
    largestContentfulPaint: string;
    timeToInteractive: string;
    speedIndex: string;
    totalBlockingTime: string;
    cumulativeLayoutShift: string;
  };
  diagnostics: {
    serverResponseTime: string;
    renderBlockingResources: number;
    unusedJavascript: string;
    unusedCss: string;
    imageOptimization: string;
  };
  opportunities: Array<{
    title: string;
    savings: string;
    savingsBytes: string;
  }>;
  error?: string;
}

export interface SeoData {
  url: string;
  score: number;
  meta: {
    title: { content: string; length: number; isOptimal: boolean };
    description: { content: string; length: number; isOptimal: boolean };
    keywords: string[];
    robots: string;
    viewport: string;
    charset: string;
    canonical: string;
  };
  headings: {
    h1: { count: number; items: string[] };
    h2: { count: number; items: string[] };
    h3: { count: number; items: string[] };
    hasH1: boolean;
    multipleH1: boolean;
  };
  images: {
    total: number;
    missingAlt: number;
    hasDimensions: number;
  };
  links: {
    total: number;
    internal: number;
    external: number;
  };
  social: {
    openGraph: {
      title: string;
      description: string;
      image: string;
      url: string;
      type: string;
      siteName: string;
    };
    twitter: {
      card: string;
      title: string;
      description: string;
      image: string;
      site: string;
    };
  };
  issues: Array<{
    severity: string;
    message: string;
    category: string;
  }>;
  error?: string;
}

export interface FeatureData {
  url: string;
  detectedFeatures: string[];
  missingFeatures: string[];
  categorized: Record<string, string[]>;
  totalDetected: number;
  recommendations: Array<{
    feature?: string;
    priority: string;
    reason: string;
    message?: string;
    type?: string;
    features?: string[];
  }>;
  error?: string;
}

export interface ComparisonData {
  techStack: {
    winner: string | null;
    insights: string[];
  };
  performance: {
    winner: string | null;
    insights: string[];
  };
  seo: {
    winner: string | null;
    insights: string[];
  };
  features: {
    winner: string | null;
    insights: string[];
    recommendations: Array<{
      feature?: string;
      priority?: string;
      reason?: string;
      type?: string;
      features?: string[];
      message?: string;
    }>;
  };
}

export interface AnalysisResult {
  timestamp: string;
  yourSite: {
    url: string;
    tech: TechStackData;
    performance: PerformanceData;
    seo: SeoData;
    features: FeatureData;
  };
  competitor: {
    url: string;
    tech: TechStackData;
    performance: PerformanceData;
    seo: SeoData;
    features: FeatureData;
  };
  comparison: ComparisonData;
}

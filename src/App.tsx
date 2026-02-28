import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { AnalysisForm } from '@/components/AnalysisForm';
import { TechStackCard } from '@/components/TechStackCard';
import { PerformanceCard } from '@/components/PerformanceCard';
import { SeoCard } from '@/components/SeoCard';
import { FeaturesCard } from '@/components/FeaturesCard';
import { ComparisonSummary } from '@/components/ComparisonSummary';
import { analyzeApi } from '@/lib/api';
import type { AnalysisResult } from '@/types';
import { 
  BarChart3, 
  Code2, 
  Zap, 
  Search, 
  Sparkles, 
  TrendingUp,
  Target,
  Loader2
} from 'lucide-react';

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (yourUrl: string, competitorUrl: string) => {
    setIsLoading(true);
    setResult(null);
    
    toast.info('Starting comprehensive analysis...', {
      description: 'This may take 30-60 seconds. Please wait.',
      duration: 5000
    });

    try {
      const data = await analyzeApi.fullAnalysis(yourUrl, competitorUrl);
      setResult(data);
      toast.success('Analysis complete!', {
        description: 'View your competitive insights below.'
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Competitor Tech Intelligence</h1>
              <p className="text-sm text-muted-foreground">
                Analyze your competitors' tech stack, performance, and features
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Analysis Form */}
        <div className="mb-8">
          <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Analyzing websites...</p>
            <p className="text-sm text-muted-foreground">
              Running tech stack detection, performance audit, SEO analysis, and feature detection
            </p>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="space-y-8">
            {/* Comparison Summary */}
            <ComparisonSummary data={result.comparison} />

            {/* Detailed Tabs */}
            <Tabs defaultValue="tech" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-fit">
                <TabsTrigger value="tech" className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Tech Stack</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">SEO</span>
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Features</span>
                </TabsTrigger>
              </TabsList>

              {/* Tech Stack Tab */}
              <TabsContent value="tech" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <TechStackCard 
                    title="Your Tech Stack" 
                    data={result.yourSite.tech} 
                  />
                  <TechStackCard 
                    title="Competitor Tech Stack" 
                    data={result.competitor.tech} 
                    isCompetitor 
                  />
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <PerformanceCard 
                    title="Your Performance" 
                    data={result.yourSite.performance} 
                  />
                  <PerformanceCard 
                    title="Competitor Performance" 
                    data={result.competitor.performance} 
                    isCompetitor 
                  />
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <SeoCard 
                    title="Your SEO" 
                    data={result.yourSite.seo} 
                  />
                  <SeoCard 
                    title="Competitor SEO" 
                    data={result.competitor.seo} 
                    isCompetitor 
                  />
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FeaturesCard 
                    title="Your Features" 
                    data={result.yourSite.features} 
                  />
                  <FeaturesCard 
                    title="Competitor Features" 
                    data={result.competitor.features} 
                    isCompetitor 
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
              <p>Analysis completed at {new Date(result.timestamp).toLocaleString()}</p>
              <p className="mt-1">
                Comparing {result.yourSite.url} vs {result.competitor.url}
              </p>
            </footer>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && (
          <div className="text-center py-16">
            <div className="flex justify-center gap-4 mb-6">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Code2 className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-xl">
                <Search className="w-8 h-8 text-green-600 dark:text-green-300" />
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Ready to analyze your competition?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter your website and a competitor's URL above to get insights on their 
              technology stack, performance metrics, SEO optimization, and key features.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Tech Stack Detection
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance Audit
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                SEO Analysis
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Feature Detection
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { AnalysisForm } from '@/components/AnalysisForm';
import { TechStackCard } from '@/components/TechStackCard';
import { PerformanceCard } from '@/components/PerformanceCard';
import { SeoCard } from '@/components/SeoCard';
import { FeaturesCard } from '@/components/FeaturesCard';
import { ComparisonSummary } from '@/components/ComparisonSummary';
import { analyzeApi } from '@/lib/api';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (yourUrl: string, competitorUrl: string) => {
    setIsLoading(true);
    setResult(null);
    
    toast.info(t('app.analyzingTitle') || 'Starting comprehensive analysis...', {
      description: t('app.analyzingDesc') || 'This may take 30-60 seconds. Please wait.',
      duration: 5000
    });

    try {
      const data = await analyzeApi.fullAnalysis(yourUrl, competitorUrl);
      setResult(data);
      toast.success(t('app.analysisComplete') || 'Analysis complete!', {
        description: t('app.viewInsights') || 'View your competitive insights below.'
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('app.analysisFailed') || 'Analysis failed', {
        description: error instanceof Error ? error.message : (t('app.tryAgain') || 'Please try again.')
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('app.title')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('app.description')}
                </p>
              </div>
            </div>
            <LanguageSwitcher />
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
            <p className="text-lg font-medium">{t('app.analyzing')}</p>
            <p className="text-sm text-muted-foreground">
              {t('app.runningAnalysis')}
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
                  <span className="hidden sm:inline">{t('results.techStack')}</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('results.performance')}</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('results.seo')}</span>
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('results.features')}</span>
                </TabsTrigger>
              </TabsList>

              {/* Tech Stack Tab */}
              <TabsContent value="tech" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <TechStackCard 
                    title={t('techStack.yourTechStack')} 
                    data={result.yourSite.tech} 
                  />
                  <TechStackCard 
                    title={t('techStack.competitorTechStack')} 
                    data={result.competitor.tech} 
                    isCompetitor 
                  />
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <PerformanceCard 
                    title={t('performance.yourPerformance')} 
                    data={result.yourSite.performance} 
                  />
                  <PerformanceCard 
                    title={t('performance.competitorPerformance')} 
                    data={result.competitor.performance} 
                    isCompetitor 
                  />
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <SeoCard 
                    title={t('seo.yourSEO')} 
                    data={result.yourSite.seo} 
                  />
                  <SeoCard 
                    title={t('seo.competitorSEO')} 
                    data={result.competitor.seo} 
                    isCompetitor 
                  />
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FeaturesCard 
                    title={t('features.yourFeatures')} 
                    data={result.yourSite.features} 
                  />
                  <FeaturesCard 
                    title={t('features.competitorFeatures')} 
                    data={result.competitor.features} 
                    isCompetitor 
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
              <p>{t('app.analysisCompletedAt')} {new Date(result.timestamp).toLocaleString()}</p>
              <p className="mt-1">
                {t('app.comparing')} {result.yourSite.url} vs {result.competitor.url}
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
            <h2 className="text-xl font-semibold mb-2">{t('app.readyToAnalyze')}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('app.enterUrls')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('app.techStackDetection')}
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('app.performanceAudit')}
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                {t('app.seoAnalysis')}
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('app.featureDetection')}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

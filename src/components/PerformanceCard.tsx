import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Clock, Gauge, AlertTriangle, Lightbulb } from 'lucide-react';
import type { PerformanceData } from '@/types';

interface PerformanceCardProps {
  title: string;
  data: PerformanceData;
  isCompetitor?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};



export function PerformanceCard({ title, data, isCompetitor = false }: PerformanceCardProps) {
  if (data.error) {
    return (
      <Card className={isCompetitor ? 'border-red-200 dark:border-red-800' : ''}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Failed to analyze: {data.error}</p>
        </CardContent>
      </Card>
    );
  }

  const scores = data.scores || {};
  const timing = data.timing || {};
  const opportunities = data.opportunities || [];

  return (
    <Card className={isCompetitor ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Performance</span>
              <span className={`font-semibold ${getScoreColor(scores.performance)}`}>
                {scores.performance}
              </span>
            </div>
            <Progress value={scores.performance} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accessibility</span>
              <span className={`font-semibold ${getScoreColor(scores.accessibility)}`}>
                {scores.accessibility}
              </span>
            </div>
            <Progress value={scores.accessibility} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Best Practices</span>
              <span className={`font-semibold ${getScoreColor(scores.bestPractices)}`}>
                {scores.bestPractices}
              </span>
            </div>
            <Progress value={scores.bestPractices} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">SEO</span>
              <span className={`font-semibold ${getScoreColor(scores.seo)}`}>
                {scores.seo}
              </span>
            </div>
            <Progress value={scores.seo} className="h-2" />
          </div>
        </div>

        <Separator />

        {/* Timing Metrics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="w-4 h-4" />
            Core Web Vitals
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">First Contentful Paint</span>
              <span className="font-mono">{timing.firstContentfulPaint || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Largest Contentful Paint</span>
              <span className="font-mono">{timing.largestContentfulPaint || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time to Interactive</span>
              <span className="font-mono">{timing.timeToInteractive || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed Index</span>
              <span className="font-mono">{timing.speedIndex || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Blocking Time</span>
              <span className="font-mono">{timing.totalBlockingTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cumulative Layout Shift</span>
              <span className="font-mono">{timing.cumulativeLayoutShift || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="w-4 h-4" />
                Top Opportunities
              </div>
              <div className="space-y-2">
                {opportunities.slice(0, 3).map((opp, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{opp.title}</span>
                      <span className="text-muted-foreground ml-2">
                        Save {opp.savings}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

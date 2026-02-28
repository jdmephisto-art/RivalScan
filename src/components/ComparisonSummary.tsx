import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, Search, Code2, Sparkles } from 'lucide-react';
import type { ComparisonData } from '@/types';

interface ComparisonSummaryProps {
  data: ComparisonData;
}

const WinnerBadge = ({ winner }: { winner: string | null }) => {
  if (winner === 'you') {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <Trophy className="w-3 h-3 mr-1" />
        You Win
      </Badge>
    );
  }
  if (winner === 'competitor') {
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <Target className="w-3 h-3 mr-1" />
        Competitor Wins
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      Tie
    </Badge>
  );
};

export function ComparisonSummary({ data }: ComparisonSummaryProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Competitive Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tech Stack Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Technology Stack</span>
            </div>
            <WinnerBadge winner={data.techStack.winner} />
          </div>
          <div className="space-y-1">
            {data.techStack.insights.map((insight, idx) => (
              <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {insight}
              </p>
            ))}
          </div>
        </div>

        <Separator />

        {/* Performance Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Performance</span>
            </div>
            <WinnerBadge winner={data.performance.winner} />
          </div>
          <div className="space-y-1">
            {data.performance.insights.map((insight, idx) => (
              <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {insight}
              </p>
            ))}
          </div>
        </div>

        <Separator />

        {/* SEO Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-green-500" />
              <span className="font-medium">SEO</span>
            </div>
            <WinnerBadge winner={data.seo.winner} />
          </div>
          <div className="space-y-1">
            {data.seo.insights.map((insight, idx) => (
              <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {insight}
              </p>
            ))}
          </div>
        </div>

        <Separator />

        {/* Features Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-medium">Features</span>
            </div>
            <WinnerBadge winner={data.features.winner} />
          </div>
          <div className="space-y-1">
            {data.features.insights.map((insight, idx) => (
              <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {insight}
              </p>
            ))}
          </div>
        </div>

        {/* Actionable Recommendations */}
        {data.features.recommendations && data.features.recommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Actionable Recommendations</span>
              </div>
              <div className="space-y-2">
                {data.features.recommendations.slice(0, 5).map((rec, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        {rec.message && (
                          <p className="text-sm font-medium">{rec.message}</p>
                        )}
                        {rec.feature && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm">{rec.feature}</span>
                            {rec.priority && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  rec.priority === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : rec.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {rec.priority}
                              </Badge>
                            )}
                          </div>
                        )}
                        {rec.reason && (
                          <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                        )}
                      </div>
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

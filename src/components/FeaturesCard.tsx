import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, CheckCircle, XCircle, Lightbulb, MessageSquare, TrendingUp, Shield, FileText, Settings } from 'lucide-react';
import type { FeatureData } from '@/types';

interface FeaturesCardProps {
  title: string;
  data: FeatureData;
  isCompetitor?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Communication': <MessageSquare className="w-4 h-4" />,
  'Conversion': <TrendingUp className="w-4 h-4" />,
  'Trust': <Shield className="w-4 h-4" />,
  'Content': <FileText className="w-4 h-4" />,
  'Functionality': <Settings className="w-4 h-4" />
};

const categoryColors: Record<string, string> = {
  'Communication': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Conversion': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Trust': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Content': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Functionality': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

export function FeaturesCard({ title, data, isCompetitor = false }: FeaturesCardProps) {
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

  const detected = data.detectedFeatures || [];
  const missing = data.missingFeatures || [];
  const categorized = data.categorized || {};
  const recommendations = data.recommendations || [];

  return (
    <Card className={isCompetitor ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {title}
          </div>
          <Badge variant="secondary" className="font-mono">
            {data.totalDetected || 0} features
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categorized Features */}
        {Object.keys(categorized).length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Detected Features</div>
            {Object.entries(categorized).map(([category, features]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {categoryIcons[category] || <Sparkles className="w-4 h-4" />}
                  {category}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className={`text-xs ${categoryColors[category] || ''}`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Missing Features */}
        {missing.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Potentially Missing</div>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs text-muted-foreground">
                    <XCircle className="w-3 h-3 mr-1" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="w-4 h-4" />
                Recommendations
              </div>
              <div className="space-y-2">
                {recommendations.slice(0, 4).map((rec, idx) => (
                  <div key={idx} className="p-2 bg-muted rounded text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      {rec.feature && (
                        <span className="font-medium">{rec.feature}</span>
                      )}
                      {rec.priority && (
                        <Badge className={`text-xs ${priorityColors[rec.priority]}`}>
                          {rec.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {rec.reason || rec.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* All Features List */}
        {detected.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">All Detected Features</div>
              <div className="flex flex-wrap gap-1.5">
                {detected.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, AlertCircle, CheckCircle, Info, Tag, Heading, Image, Link2, Share2 } from 'lucide-react';
import type { SeoData } from '@/types';

interface SeoCardProps {
  title: string;
  data: SeoData;
  isCompetitor?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'warning':
      return <Info className="w-4 h-4 text-yellow-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
};

export function SeoCard({ title, data, isCompetitor = false }: SeoCardProps) {
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

  const meta = data.meta || {};
  const headings = data.headings || {};
  const images = data.images || {};
  const links = data.links || {};
  const social = data.social || {};
  const issues = data.issues || [];

  return (
    <Card className={isCompetitor ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {title}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
              {data.score}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meta Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Tag className="w-4 h-4" />
            Meta Tags
          </div>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-muted rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">Title</span>
                {meta.title?.isOptimal ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                )}
              </div>
              <p className="font-medium truncate">{meta.title?.content || 'Not set'}</p>
              <p className="text-xs text-muted-foreground">{meta.title?.length || 0} characters</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">Description</span>
                {meta.description?.isOptimal ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                )}
              </div>
              <p className="text-muted-foreground line-clamp-2">{meta.description?.content || 'Not set'}</p>
              <p className="text-xs text-muted-foreground">{meta.description?.length || 0} characters</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Headings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Heading className="w-4 h-4" />
            Headings Structure
          </div>
          <div className="flex gap-2">
            {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((h) => {
              const headingData = headings[h as keyof typeof headings] as { count: number; items: string[] } | undefined;
              const count = headingData?.count ?? 0;
              return (
                <div key={h} className="text-center">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                    count > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {count}
                  </div>
                  <span className="text-xs text-muted-foreground">{h.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
          {!headings.hasH1 && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Missing H1 tag
            </p>
          )}
          {headings.multipleH1 && (
            <p className="text-xs text-yellow-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Multiple H1 tags detected
            </p>
          )}
        </div>

        <Separator />

        {/* Images & Links */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Image className="w-4 h-4" />
              Images
            </div>
            <div className="text-sm space-y-1">
              <p>Total: {images.total || 0}</p>
              <p className={images.missingAlt > 0 ? 'text-yellow-600' : 'text-green-600'}>
                Missing alt: {images.missingAlt || 0}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Link2 className="w-4 h-4" />
              Links
            </div>
            <div className="text-sm space-y-1">
              <p>Total: {links.total || 0}</p>
              <p>Internal: {links.internal || 0}</p>
              <p>External: {links.external || 0}</p>
            </div>
          </div>
        </div>

        {/* Social Tags */}
        {(social.openGraph?.title || social.twitter?.card) && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Share2 className="w-4 h-4" />
                Social Tags
              </div>
              <div className="flex gap-2">
                {social.openGraph?.title && (
                  <Badge variant="outline" className="text-xs">Open Graph</Badge>
                )}
                {social.twitter?.card && (
                  <Badge variant="outline" className="text-xs">Twitter Card</Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* Issues */}
        {issues.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Issues Found</div>
              <div className="space-y-2">
                {issues.slice(0, 5).map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    {getSeverityIcon(issue.severity)}
                    <span className={issue.severity === 'critical' ? 'text-red-600' : ''}>
                      {issue.message}
                    </span>
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

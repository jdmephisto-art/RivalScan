import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Code2, Server, Palette, BarChart3, MessageSquare, CreditCard, Globe, Wrench } from 'lucide-react';
import type { TechStackData } from '@/types';

interface TechStackCardProps {
  title: string;
  data: TechStackData;
  isCompetitor?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Framework': <Code2 className="w-4 h-4" />,
  'Styling': <Palette className="w-4 h-4" />,
  'Analytics': <BarChart3 className="w-4 h-4" />,
  'Communication': <MessageSquare className="w-4 h-4" />,
  'Payment': <CreditCard className="w-4 h-4" />,
  'Hosting': <Server className="w-4 h-4" />,
  'CMS': <Globe className="w-4 h-4" />,
  'Utilities': <Wrench className="w-4 h-4" />
};

const categoryColors: Record<string, string> = {
  'Framework': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Styling': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Analytics': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Communication': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Payment': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Hosting': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'CMS': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'Utilities': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
};

export function TechStackCard({ title, data, isCompetitor = false }: TechStackCardProps) {
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

  const hasData = data.technologies && data.technologies.length > 0;

  return (
    <Card className={isCompetitor ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <Badge variant="secondary" className="font-mono">
            {data.totalCount} detected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <p className="text-sm text-muted-foreground">No technologies detected</p>
        ) : (
          Object.entries(data.categorized || {}).map(([category, techs]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {categoryIcons[category] || <Wrench className="w-4 h-4" />}
                {category}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {techs.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className={`text-xs ${categoryColors[category] || ''}`}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
        
        {hasData && data.technologies.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">All Technologies</div>
              <div className="flex flex-wrap gap-1.5">
                {data.technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
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

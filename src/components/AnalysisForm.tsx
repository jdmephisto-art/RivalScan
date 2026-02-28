import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Zap, Target } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisFormProps {
  onAnalyze: (yourUrl: string, competitorUrl: string) => void;
  isLoading: boolean;
}

// Normalize URL - add https:// if missing and validate
function normalizeUrl(url: string): string | null {
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
    // Ensure there's a hostname
    if (!urlObj.hostname || urlObj.hostname === '') {
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

export function AnalysisForm({ onAnalyze, isLoading }: AnalysisFormProps) {
  const [yourUrl, setYourUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!yourUrl || !competitorUrl) {
      toast.error('Please enter both URLs');
      return;
    }
    
    const normalizedYourUrl = normalizeUrl(yourUrl);
    const normalizedCompetitorUrl = normalizeUrl(competitorUrl);
    
    if (!normalizedYourUrl) {
      toast.error('Invalid URL format for Your Website');
      return;
    }
    
    if (!normalizedCompetitorUrl) {
      toast.error('Invalid URL format for Competitor Website');
      return;
    }
    
    onAnalyze(normalizedYourUrl, normalizedCompetitorUrl);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-border/50">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="yourUrl" className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-yellow-500" />
              Your Website
            </Label>
            <Input
              id="yourUrl"
              placeholder="example.com or https://example.com"
              value={yourUrl}
              onChange={(e) => setYourUrl(e.target.value)}
              className="h-12 text-base"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="competitorUrl" className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-red-500" />
              Competitor Website
            </Label>
            <Input
              id="competitorUrl"
              placeholder="competitor.com or https://competitor.com"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              className="h-12 text-base"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || !yourUrl || !competitorUrl}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing... (this may take 30-60 seconds)
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Analyze Competitor
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

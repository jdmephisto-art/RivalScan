import axios from 'axios';
import type { AnalysisResult, TechStackData, PerformanceData, SeoData, FeatureData } from '@/types';

const API_BASE = '/api';

export const analyzeApi = {
  async fullAnalysis(yourUrl: string, competitorUrl: string): Promise<AnalysisResult> {
    const response = await axios.post(`${API_BASE}/analyze/full`, {
      yourUrl,
      competitorUrl
    });
    return response.data;
  },

  async analyzeTech(url: string): Promise<TechStackData> {
    const response = await axios.post(`${API_BASE}/analyze/tech`, { url });
    return response.data;
  },

  async analyzePerformance(url: string): Promise<PerformanceData> {
    const response = await axios.post(`${API_BASE}/analyze/performance`, { url });
    return response.data;
  },

  async analyzeSeo(url: string): Promise<SeoData> {
    const response = await axios.post(`${API_BASE}/analyze/seo`, { url });
    return response.data;
  },

  async analyzeFeatures(url: string): Promise<FeatureData> {
    const response = await axios.post(`${API_BASE}/analyze/features`, { url });
    return response.data;
  }
};

export default analyzeApi;

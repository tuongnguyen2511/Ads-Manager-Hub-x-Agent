
export type PlatformId = 'facebook' | 'google' | 'tiktok' | 'zalo';

export interface Platform {
  id: PlatformId;
  name: string;
  color: string;
  icon: string;
}

export interface Ad {
  id: string;
  name: string;
  headline: string;
  content: string;
  headlines?: string[]; // Cho Google Search RSA
  descriptions?: string[]; // Cho Google Search RSA
  image?: string;
  status: 'active' | 'paused';
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface AdGroup {
  id: string;
  name: string;
  status: 'active' | 'paused';
  targeting: string;
  keywords?: string[]; // Từ khóa cho Google Search
  ads: Ad[];
}

export interface Campaign {
  id: string;
  name: string;
  platform: PlatformId;
  status: 'active' | 'paused' | 'draft';
  objective: string;
  budget: number;
  biddingStrategy?: string;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  startDate: string;
  adGroups?: AdGroup[];
}

export interface CampaignFormData {
  name: string;
  platform: PlatformId;
  objective: string;
  dailyBudget: number;
  targetLocation: string;
  targetAge: string;
  targetInterests: string;
  // Google Search specific
  keywords: string[];
  headlines: string[];
  descriptions: string[];
  // Generic
  adHeadline: string;
  adContent: string;
}

export interface AIMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'spend';
  method?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface ForecastMetric {
  date: string;
  clicks: number;
  impressions: number;
  conversions: number;
  cost: number;
  [key: string]: any;
}

export interface ChannelForecast {
  platform: PlatformId;
  estimatedReach: number;
  estimatedCpc: number;
  estimatedConversionRate: number;
  suggestedBudget: number;
  [key: string]: any;
}

export interface ForecastResult {
  dailyData: ForecastMetric[];
  channelBreakdown: ChannelForecast[];
  summary: {
    totalReach: number;
    totalConversions: number;
    avgCpa: number;
    roiPrediction: number;
  };
  aiAnalysis: string;
}

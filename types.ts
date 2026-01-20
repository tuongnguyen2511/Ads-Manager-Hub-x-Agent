
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
  ads: Ad[];
}

export interface Campaign {
  id: string;
  name: string;
  platform: PlatformId;
  status: 'active' | 'paused' | 'draft';
  objective: string;
  budget: number;
  biddingStrategy?: string; // New field for bidding
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  startDate: string;
  adGroups?: AdGroup[]; // Added hierarchical data
}

export interface CampaignFormData {
  name: string;
  platform: PlatformId;
  objective: string;
  dailyBudget: number;
  targetLocation: string;
  targetAge: string;
  targetInterests: string;
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

// --- Planning & Forecast Types ---

export interface ForecastMetric {
  date: string;
  clicks: number;
  impressions: number;
  conversions: number;
  cost: number;
}

export interface ChannelForecast {
  platform: PlatformId;
  estimatedReach: number;
  estimatedCpc: number;
  estimatedConversionRate: number;
  suggestedBudget: number;
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

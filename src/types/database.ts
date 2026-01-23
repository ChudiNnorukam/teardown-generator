// Database types for SaaS Teardown Generator
// Generated from supabase/migrations/001_initial_schema.sql

export type TeardownStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type Plan = 'free' | 'pro';

export interface Teardown {
  id: string;
  user_id: string | null;
  session_id: string | null;
  target_url: string;
  target_domain: string;
  status: TeardownStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeardownInsert {
  user_id?: string | null;
  session_id?: string | null;
  target_url: string;
  status?: TeardownStatus;
  error_message?: string | null;
}

export interface TeardownUpdate {
  status?: TeardownStatus;
  error_message?: string | null;
}

// Analysis result types
export interface TechStackItem {
  name: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
}

export interface PricingAnalysis {
  found: boolean;
  url?: string;
  tiers?: PricingTier[];
}

export interface SEOCheck {
  name: string;
  passed: boolean;
  value: string | number | boolean | null;
  recommendation: string;
}

export interface SEOAudit {
  score: number;
  checks: SEOCheck[];
  summary: string;
}

export interface CloneBreakdown {
  component: string;
  hours: number;
  reason: string;
}

export interface CloneEstimate {
  totalHours: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  breakdown: CloneBreakdown[];
  requiredSkills: string[];
  similarOpenSource: string[];
}

export interface TeardownResult {
  id: string;
  teardown_id: string;
  tech_stack: TechStackItem[];
  pricing_analysis: PricingAnalysis;
  seo_audit: SEOAudit;
  clone_estimate: CloneEstimate;
  raw_html_hash: string | null;
  created_at: string;
}

export interface TeardownResultInsert {
  teardown_id: string;
  tech_stack?: TechStackItem[];
  pricing_analysis?: PricingAnalysis;
  seo_audit?: SEOAudit;
  clone_estimate?: CloneEstimate;
  raw_html_hash?: string | null;
}

export interface UsageTracking {
  id: string;
  user_id: string | null;
  session_id: string | null;
  ip_hash: string | null;
  date: string;
  teardown_count: number;
  plan: Plan;
  stripe_customer_id: string | null;
}

export interface UsageTrackingInsert {
  user_id?: string | null;
  session_id?: string | null;
  ip_hash?: string | null;
  date?: string;
  teardown_count?: number;
  plan?: Plan;
  stripe_customer_id?: string | null;
}

// Combined teardown with results
export interface TeardownWithResults extends Teardown {
  results?: TeardownResult | null;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      teardowns: {
        Row: Teardown;
        Insert: TeardownInsert;
        Update: TeardownUpdate;
      };
      teardown_results: {
        Row: TeardownResult;
        Insert: TeardownResultInsert;
        Update: Partial<TeardownResultInsert>;
      };
      usage_tracking: {
        Row: UsageTracking;
        Insert: UsageTrackingInsert;
        Update: Partial<UsageTrackingInsert>;
      };
    };
  };
}

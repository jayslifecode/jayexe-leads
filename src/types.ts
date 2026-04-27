export type EvaluationPath = 'no_website' | 'has_website'

export type FlagReason =
  | 'no_website'
  | 'bad_design'
  | 'outdated_website'
  | 'broken_website'

export type LeadStatus = 'pending' | 'approved' | 'rejected' | 'emailed'

export interface ScoreBreakdownNoWebsite {
  facebook_post_recency: number
  facebook_followers: number
  facebook_engagement: number
  google_business_exists: number
  google_reviews: number
  has_contact_info: number
}

export interface ScoreBreakdownHasWebsite {
  pagespeed_score: number
  mobile_friendly: boolean
  built_year: number | null
  claude_visual_score: 'good' | 'mediocre' | 'poor'
  has_contact_info: boolean
}

export interface Lead {
  id: string
  date_found: string
  name: string
  category: string
  location: string
  phone: string | null
  email: string | null
  google_maps_url: string | null
  facebook_page_url: string | null
  website_url: string | null
  website_screenshot: string | null
  evaluation_path: EvaluationPath
  flag_reason: FlagReason
  score: number
  score_breakdown: ScoreBreakdownNoWebsite | ScoreBreakdownHasWebsite
  demo_url: string | null
  demo_created_at: string | null
  demo_expires_at: string | null
  status: LeadStatus
}

export interface DiscoveredBusiness {
  name: string
  category: string
  location: string
  phone: string | null
  email: string | null
  google_maps_url: string | null
  facebook_page_url: string | null
  website_url: string | null
  facebook_last_post_days_ago: number | null
  facebook_follower_count: number | null
  facebook_responds_to_messages: boolean
  google_review_count: number | null
}

export interface DailyReport {
  date: string
  total_discovered: number
  total_leads: number
  leads: Lead[]
}

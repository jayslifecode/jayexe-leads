import type { DiscoveredBusiness, ScoreBreakdownNoWebsite } from '../types.js'

const LEAD_THRESHOLD = 40

const RECENCY_WEEK_DAYS = 7
const RECENCY_MONTH_DAYS = 30
const RECENCY_WEEK_POINTS = 30
const RECENCY_MONTH_POINTS = 20

const FOLLOWERS_HIGH = 100
const FOLLOWERS_MED = 50
const FOLLOWERS_HIGH_POINTS = 15
const FOLLOWERS_MED_POINTS = 8

const ENGAGEMENT_POINTS = 10
const GOOGLE_EXISTS_POINTS = 15

const REVIEWS_HIGH = 10
const REVIEWS_HIGH_POINTS = 10
const REVIEWS_ANY_POINTS = 5

const CONTACT_INFO_POINTS = 20

interface ActivityScoreResult {
  score: number
  isLead: boolean
  breakdown: ScoreBreakdownNoWebsite
}

export function scoreActivityPath(
  business: DiscoveredBusiness
): ActivityScoreResult {
  const breakdown: ScoreBreakdownNoWebsite = {
    facebook_post_recency: scoreFacebookPostRecency(business.facebook_last_post_days_ago),
    facebook_followers: scoreFacebookFollowers(business.facebook_follower_count),
    facebook_engagement: business.facebook_responds_to_messages ? ENGAGEMENT_POINTS : 0,
    google_business_exists: business.google_maps_url !== null ? GOOGLE_EXISTS_POINTS : 0,
    google_reviews: scoreGoogleReviews(business.google_review_count),
    contact_info_points: business.phone !== null || business.email !== null ? CONTACT_INFO_POINTS : 0,
  }

  const score = Object.values(breakdown).reduce((sum, points) => sum + points, 0)

  return { score, isLead: score >= LEAD_THRESHOLD, breakdown }
}

function scoreFacebookPostRecency(daysAgo: number | null): number {
  if (daysAgo === null) return 0
  if (daysAgo <= RECENCY_WEEK_DAYS) return RECENCY_WEEK_POINTS
  if (daysAgo <= RECENCY_MONTH_DAYS) return RECENCY_MONTH_POINTS
  return 0
}

function scoreFacebookFollowers(count: number | null): number {
  if (count === null) return 0
  if (count >= FOLLOWERS_HIGH) return FOLLOWERS_HIGH_POINTS
  if (count >= FOLLOWERS_MED) return FOLLOWERS_MED_POINTS
  return 0
}

function scoreGoogleReviews(count: number | null): number {
  if (count === null) return 0
  if (count >= REVIEWS_HIGH) return REVIEWS_HIGH_POINTS
  if (count >= 1) return REVIEWS_ANY_POINTS
  return 0
}

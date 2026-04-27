import type { DiscoveredBusiness, ScoreBreakdownNoWebsite } from '../types.js'

interface ActivityScoreResult {
  score: number
  isLead: boolean
  breakdown: ScoreBreakdownNoWebsite
}

export function scoreActivityPath(
  business: DiscoveredBusiness
): ActivityScoreResult {
  const breakdown: ScoreBreakdownNoWebsite = {
    facebook_post_recency: scoreFacebookPostRecency(
      business.facebook_last_post_days_ago
    ),
    facebook_followers: scoreFacebookFollowers(
      business.facebook_follower_count
    ),
    facebook_engagement: scoreFacebookEngagement(
      business.facebook_responds_to_messages
    ),
    google_business_exists: scoreGoogleBusinessExists(
      business.google_maps_url
    ),
    google_reviews: scoreGoogleReviews(business.google_review_count),
    contact_info_points: scoreContactInfo(business.phone, business.email),
  }

  const score = Object.values(breakdown).reduce((sum, points) => sum + points, 0)
  const isLead = score >= 40

  return {
    score,
    isLead,
    breakdown,
  }
}

function scoreFacebookPostRecency(daysAgo: number | null): number {
  if (daysAgo === null) return 0
  if (daysAgo <= 7) return 30
  if (daysAgo <= 30) return 20
  return 0
}

function scoreFacebookFollowers(followerCount: number | null): number {
  if (followerCount === null) return 0
  if (followerCount >= 100) return 15
  if (followerCount >= 50) return 8
  return 0
}

function scoreFacebookEngagement(respondsToMessages: boolean): number {
  return respondsToMessages ? 10 : 0
}

function scoreGoogleBusinessExists(googleMapsUrl: string | null): number {
  return googleMapsUrl !== null ? 15 : 0
}

function scoreGoogleReviews(reviewCount: number | null): number {
  if (reviewCount === null) return 0
  if (reviewCount >= 10) return 10
  if (reviewCount >= 1) return 5
  return 0
}

function scoreContactInfo(
  phone: string | null,
  email: string | null
): number {
  return phone !== null || email !== null ? 20 : 0
}

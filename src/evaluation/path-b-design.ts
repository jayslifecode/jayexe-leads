import type { FlagReason, ScoreBreakdownHasWebsite } from '../types.js'

const BROKEN_WEBSITE_SCORE = 5
const LEAD_THRESHOLD = 50

const PAGESPEED_MIN = 0
const PAGESPEED_MAX = 100

const MOBILE_FRIENDLY_DEDUCTION = 20
const OUTDATED_WEBSITE_DEDUCTION = 15
const OUTDATED_YEAR_THRESHOLD = 2018

const CONTACT_INFO_BONUS = 10

const GOOD_PAGESPEED_THRESHOLD = 70
const MEDIOCRE_PAGESPEED_THRESHOLD = 40

interface DesignScoreResult {
  score: number
  isLead: boolean
  flagReason: FlagReason
  breakdown: ScoreBreakdownHasWebsite
}

interface PageSpeedResponse {
  lighthouseResult: {
    categories: {
      performance: {
        score: number
      }
    }
    audits: {
      viewport?: {
        score: number
      }
    }
  }
}

export async function scoreDesignPath(
  websiteUrl: string,
  builtYear: number | null,
  hasContactInfo: boolean
): Promise<DesignScoreResult> {
  let pagespeedScore = 0
  let mobileWorthy = false

  try {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(websiteUrl)}&strategy=mobile`
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = (await response.json()) as PageSpeedResponse
    const performanceScore = data.lighthouseResult.categories.performance.score
    pagespeedScore = Math.round(performanceScore * 100)
    mobileWorthy = data.lighthouseResult.audits.viewport?.score === 1
  } catch {
    // Network error or API failure
    return {
      score: BROKEN_WEBSITE_SCORE,
      isLead: true,
      flagReason: 'broken_website',
      breakdown: {
        pagespeed_score: BROKEN_WEBSITE_SCORE,
        mobile_friendly: false,
        built_year: builtYear,
        claude_visual_score: 'poor',
        has_contact_info: hasContactInfo
      }
    }
  }

  // Calculate score with deductions and bonuses
  let score = pagespeedScore

  // Deduction: not mobile-friendly
  if (!mobileWorthy) {
    score -= MOBILE_FRIENDLY_DEDUCTION
  }

  // Deduction: outdated website
  if (builtYear !== null && builtYear < OUTDATED_YEAR_THRESHOLD) {
    score -= OUTDATED_WEBSITE_DEDUCTION
  }

  // Bonus: has contact info
  if (hasContactInfo) {
    score += CONTACT_INFO_BONUS
  }

  // Clamp to [0, 100]
  score = Math.max(PAGESPEED_MIN, Math.min(PAGESPEED_MAX, score))

  // Determine visual score
  let claudeVisualScore: 'good' | 'mediocre' | 'poor'
  if (pagespeedScore >= GOOD_PAGESPEED_THRESHOLD) {
    claudeVisualScore = 'good'
  } else if (pagespeedScore >= MEDIOCRE_PAGESPEED_THRESHOLD) {
    claudeVisualScore = 'mediocre'
  } else {
    claudeVisualScore = 'poor'
  }

  // Determine flag reason
  let flagReason: FlagReason
  if (builtYear !== null && builtYear < OUTDATED_YEAR_THRESHOLD) {
    flagReason = 'outdated_website'
  } else {
    flagReason = 'bad_design'
  }

  const breakdown: ScoreBreakdownHasWebsite = {
    pagespeed_score: pagespeedScore,
    mobile_friendly: mobileWorthy,
    built_year: builtYear,
    claude_visual_score: claudeVisualScore,
    has_contact_info: hasContactInfo
  }

  return {
    score,
    isLead: score < LEAD_THRESHOLD,
    flagReason,
    breakdown
  }
}

import { describe, it, expect } from 'vitest'
import { scoreActivityPath } from '../../src/evaluation/path-a-activity.js'
import type { DiscoveredBusiness } from '../../src/types.js'

const base: DiscoveredBusiness = {
  name: "Joe's Salon",
  category: 'Hair Salon',
  location: 'Austin, TX',
  phone: '+1 512 555 0123',
  email: null,
  google_maps_url: 'https://maps.google.com/test',
  facebook_page_url: 'https://facebook.com/joessalon',
  website_url: null,
  facebook_last_post_days_ago: null,
  facebook_follower_count: null,
  facebook_responds_to_messages: false,
  google_review_count: null,
}

describe('scoreActivityPath', () => {
  it('gives high score to very active business', () => {
    const business: DiscoveredBusiness = {
      ...base,
      facebook_last_post_days_ago: 3,
      facebook_follower_count: 500,
      facebook_responds_to_messages: true,
      google_review_count: 25,
      phone: '+1 512 555 0123',
    }
    const result = scoreActivityPath(business)
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.isLead).toBe(true)
  })

  it('gives low score to inactive business with no contact info', () => {
    const business: DiscoveredBusiness = {
      ...base,
      facebook_last_post_days_ago: 90,
      facebook_follower_count: 5,
      facebook_responds_to_messages: false,
      google_review_count: 0,
      phone: null,
      email: null,
    }
    const result = scoreActivityPath(business)
    expect(result.score).toBeLessThan(40)
    expect(result.isLead).toBe(false)
  })

  it('marks as lead when score is 40 or above', () => {
    const business: DiscoveredBusiness = {
      ...base,
      facebook_last_post_days_ago: 20,
      facebook_follower_count: 150,
      facebook_responds_to_messages: false,
      google_review_count: 10,
      phone: '+1 512 555 0123',
    }
    const result = scoreActivityPath(business)
    expect(result.isLead).toBe(true)
  })

  it('returns correct score breakdown', () => {
    const business: DiscoveredBusiness = {
      ...base,
      facebook_last_post_days_ago: 5,
      facebook_follower_count: 200,
      facebook_responds_to_messages: true,
      google_review_count: 15,
      phone: '+1 512 555 0123',
    }
    const result = scoreActivityPath(business)
    expect(result.breakdown.facebook_post_recency).toBe(30)
    expect(result.breakdown.facebook_followers).toBe(15)
    expect(result.breakdown.facebook_engagement).toBe(10)
    expect(result.breakdown.google_reviews).toBe(10)
    // field is contact_info_points (NOT has_contact_info)
    expect(result.breakdown.contact_info_points).toBe(20)
  })
})

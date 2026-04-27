import { describe, it, expect } from 'vitest'
import { generateHtmlReport } from '../../src/report/html-report.js'
import type { Lead } from '../../src/types.js'

const mockLead: Lead = {
  id: 'test-1',
  date_found: '2026-04-27',
  name: "Joe's Dental",
  category: 'Dentist',
  location: 'Austin, TX',
  phone: '+1 512 555 0123',
  email: 'joe@dental.com',
  google_maps_url: 'https://maps.google.com/test',
  facebook_page_url: 'https://facebook.com/joesdental',
  website_url: null,
  website_screenshot: null,
  evaluation_path: 'no_website',
  flag_reason: 'no_website',
  score: 75,
  score_breakdown: {
    facebook_post_recency: 30,
    facebook_followers: 15,
    facebook_engagement: 10,
    google_business_exists: 15,
    google_reviews: 5,
    contact_info_points: 0,
  },
  demo_url: null,
  demo_created_at: null,
  demo_expires_at: null,
  status: 'pending',
}

describe('generateHtmlReport', () => {
  it('returns a string containing valid HTML', () => {
    const html = generateHtmlReport([mockLead], '2026-04-27')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain("Joe's Dental")
  })

  it('includes business name, location, and flag reason', () => {
    const html = generateHtmlReport([mockLead], '2026-04-27')
    expect(html).toContain('Austin, TX')
    expect(html).toContain('no_website')
    expect(html).toContain('75')
  })

  it('includes approve and reject buttons per lead', () => {
    const html = generateHtmlReport([mockLead], '2026-04-27')
    expect(html).toContain('Approve')
    expect(html).toContain('Reject')
    expect(html).toContain('test-1')
  })

  it('handles empty lead list gracefully', () => {
    const html = generateHtmlReport([], '2026-04-27')
    expect(html).toContain('No leads found')
  })
})

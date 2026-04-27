import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { saveLeads, loadLeads, appendToMaster } from '../../src/storage/lead-store.js'
import { mkdirSync, rmSync } from 'fs'
import type { Lead } from '../../src/types.js'

const TEST_DIR = '/tmp/lead-engine-test'

const mockLead: Lead = {
  id: 'test-uuid-1',
  date_found: '2026-04-27',
  name: "Joe's Dental",
  category: 'Dentist',
  location: 'Austin, TX',
  phone: '+1 512 555 0123',
  email: null,
  google_maps_url: 'https://maps.google.com/test',
  facebook_page_url: null,
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

beforeEach(() => mkdirSync(TEST_DIR, { recursive: true }))
afterEach(() => rmSync(TEST_DIR, { recursive: true, force: true }))

describe('lead store', () => {
  it('saves and loads leads for a date', async () => {
    await saveLeads([mockLead], '2026-04-27', TEST_DIR)
    const loaded = await loadLeads('2026-04-27', TEST_DIR)
    expect(loaded).toHaveLength(1)
    expect(loaded[0].name).toBe("Joe's Dental")
  })

  it('returns empty array when no leads file exists', async () => {
    const loaded = await loadLeads('2026-01-01', TEST_DIR)
    expect(loaded).toEqual([])
  })

  it('appends to master without duplicates', async () => {
    await appendToMaster([mockLead], TEST_DIR)
    await appendToMaster([mockLead], TEST_DIR)
    const master = await loadLeads('master', TEST_DIR)
    expect(master).toHaveLength(1)
  })
})

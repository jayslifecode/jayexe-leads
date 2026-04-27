import { describe, it, expect, vi } from 'vitest'
import { searchBusinesses } from '../../src/discovery/google-places.js'
import type { DiscoveredBusiness } from '../../src/types.js'

describe('searchBusinesses', () => {
  it('returns array of DiscoveredBusiness objects', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ name: "Joe's Dental", formatted_address: '123 Main St, Austin, TX', place_id: 'abc123', user_ratings_total: 47 }],
          status: 'OK'
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: { name: "Joe's Dental", formatted_address: '123 Main St, Austin, TX', formatted_phone_number: '+1 512 555 0123', website: null, url: 'https://maps.google.com/?cid=abc123', user_ratings_total: 47 },
          status: 'OK'
        })
      } as Response)

    const results = await searchBusinesses('dentist Austin Texas', 'test-api-key')
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(1)
    expect(results[0].name).toBe("Joe's Dental")
    expect(results[0].website_url).toBeNull()
    expect(results[0].phone).toBe('+1 512 555 0123')
    expect(results[0].google_review_count).toBe(47)
  })

  it('returns empty array when API returns no results', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [], status: 'ZERO_RESULTS' })
    } as Response)

    const results = await searchBusinesses('nothing here', 'test-api-key')
    expect(results).toEqual([])
  })

  it('throws when API returns error status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [], status: 'REQUEST_DENIED' })
    } as Response)

    await expect(searchBusinesses('dentist London', 'bad-key')).rejects.toThrow('Google Places API error: REQUEST_DENIED')
  })

  it('maps all DiscoveredBusiness fields correctly', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [{ place_id: 'xyz', name: 'Test', formatted_address: 'London' }], status: 'OK' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: { name: 'Test Biz', formatted_address: 'London, UK', formatted_phone_number: '+44 20 1234 5678', website: 'https://test.com', url: 'https://maps.google.com/?cid=xyz', user_ratings_total: 12 },
          status: 'OK'
        })
      } as Response)

    const results = await searchBusinesses('test London', 'key')
    expect(results[0]).toMatchObject({
      name: 'Test Biz',
      category: '',
      location: 'London, UK',
      phone: '+44 20 1234 5678',
      email: null,
      website_url: 'https://test.com',
      facebook_page_url: null,
      facebook_last_post_days_ago: null,
      facebook_follower_count: null,
      facebook_responds_to_messages: false,
      google_review_count: 12,
    })
  })
})

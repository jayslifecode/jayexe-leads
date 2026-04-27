import { describe, it, expect, vi, afterEach } from 'vitest'
import { searchBusinesses } from '../../src/discovery/google-places.js'

describe('searchBusinesses', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns array of DiscoveredBusiness objects', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        places: [
          {
            id: 'abc123',
            displayName: { text: "Joe's Dental" },
            formattedAddress: '123 Main St, Austin, TX',
            internationalPhoneNumber: '+1 512 555 0123',
            websiteUri: undefined,
            googleMapsUri: 'https://maps.google.com/?cid=abc123',
            userRatingCount: 47,
          },
        ],
      }),
    } as Response)

    const results = await searchBusinesses('dentist Austin Texas', 'test-api-key')
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(1)
    expect(results[0].name).toBe("Joe's Dental")
    expect(results[0].website_url).toBeNull()
    expect(results[0].phone).toBe('+1 512 555 0123')
    expect(results[0].google_review_count).toBe(47)
  })

  it('returns empty array when API returns no places', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const results = await searchBusinesses('nothing here', 'test-api-key')
    expect(results).toEqual([])
  })

  it('throws when API returns HTTP error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'API key invalid',
    } as Response)

    await expect(searchBusinesses('dentist London', 'bad-key')).rejects.toThrow(
      'Google Places API error 403'
    )
  })

  it('maps all DiscoveredBusiness fields correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        places: [
          {
            id: 'xyz',
            displayName: { text: 'Test Biz' },
            formattedAddress: 'London, UK',
            internationalPhoneNumber: '+44 20 1234 5678',
            websiteUri: 'https://test.com',
            googleMapsUri: 'https://maps.google.com/?cid=xyz',
            userRatingCount: 12,
          },
        ],
      }),
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

  it('handles places with missing optional fields gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        places: [{ id: 'abc', displayName: { text: 'Minimal Biz' } }],
      }),
    } as Response)

    const results = await searchBusinesses('test query', 'key')
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Minimal Biz')
    expect(results[0].phone).toBeNull()
    expect(results[0].website_url).toBeNull()
    expect(results[0].google_review_count).toBeNull()
  })
})

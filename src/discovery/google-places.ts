import type { DiscoveredBusiness } from '../types.js'

const PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.userRatingCount',
].join(',')
const MAX_RESULTS = 10

interface NewPlacesResult {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  googleMapsUri?: string
  userRatingCount?: number
}

interface NewPlacesResponse {
  places?: NewPlacesResult[]
}

export async function searchBusinesses(
  query: string,
  apiKey: string
): Promise<DiscoveredBusiness[]> {
  const res = await fetch(PLACES_TEXT_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query, languageCode: 'en', maxResultCount: MAX_RESULTS }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google Places API error ${res.status}: ${err}`)
  }

  const data: NewPlacesResponse = await res.json()

  if (!data.places || data.places.length === 0) {
    return []
  }

  return data.places.map((place) => ({
    name: place.displayName?.text ?? '',
    category: '',
    location: place.formattedAddress ?? '',
    phone: place.internationalPhoneNumber ?? null,
    email: null,
    google_maps_url: place.googleMapsUri ?? null,
    facebook_page_url: null,
    website_url: place.websiteUri ?? null,
    facebook_last_post_days_ago: null,
    facebook_follower_count: null,
    facebook_responds_to_messages: false,
    google_review_count: place.userRatingCount ?? null,
  }))
}

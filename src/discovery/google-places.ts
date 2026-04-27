import type { DiscoveredBusiness } from '../types.js'

interface GooglePlacesTextSearchResult {
  place_id: string
  name: string
  formatted_address?: string
}

interface GooglePlacesTextSearchResponse {
  results: GooglePlacesTextSearchResult[]
  status: string
}

interface GooglePlacesDetailsResult {
  name: string
  formatted_address?: string
  formatted_phone_number?: string
  website?: string
  url?: string
  user_ratings_total?: number
}

interface GooglePlacesDetailsResponse {
  result: GooglePlacesDetailsResult
  status: string
}

export async function searchBusinesses(
  query: string,
  apiKey: string
): Promise<DiscoveredBusiness[]> {
  // Step 1: Call Text Search API
  const textSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
  textSearchUrl.searchParams.append('query', query)
  textSearchUrl.searchParams.append('key', apiKey)

  const textSearchResponse = await fetch(textSearchUrl.toString())
  const textSearchData: GooglePlacesTextSearchResponse = await textSearchResponse.json()

  // Handle API errors
  if (textSearchData.status === 'ZERO_RESULTS') {
    return []
  }

  if (textSearchData.status !== 'OK') {
    throw new Error(`Google Places API error: ${textSearchData.status}`)
  }

  // Step 2: For each result, get details
  const businesses: DiscoveredBusiness[] = []

  for (const result of textSearchData.results.slice(0, 10)) {
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    detailsUrl.searchParams.append('place_id', result.place_id)
    detailsUrl.searchParams.append('fields', 'name,formatted_address,formatted_phone_number,website,url,user_ratings_total')
    detailsUrl.searchParams.append('key', apiKey)

    const detailsResponse = await fetch(detailsUrl.toString())
    const detailsData: GooglePlacesDetailsResponse = await detailsResponse.json()

    if (detailsData.status !== 'OK') {
      throw new Error(`Google Places API error: ${detailsData.status}`)
    }

    const details = detailsData.result

    const business: DiscoveredBusiness = {
      name: details.name,
      category: '',
      location: details.formatted_address || '',
      phone: details.formatted_phone_number || null,
      email: null,
      google_maps_url: details.url || null,
      facebook_page_url: null,
      website_url: details.website || null,
      facebook_last_post_days_ago: null,
      facebook_follower_count: null,
      facebook_responds_to_messages: false,
      google_review_count: details.user_ratings_total || null,
    }

    businesses.push(business)
  }

  return businesses
}

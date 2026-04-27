/**
 * Query Generator
 * Produces a rotating list of search queries for the Google Places API.
 * Uses day-of-year to deterministically select a rolling window of cities and categories.
 */

const CITIES = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'London',
  'Manchester',
  'Birmingham',
  'Sydney',
  'Melbourne',
  'Brisbane',
  'Toronto',
  'Vancouver',
  'Calgary',
  'Berlin',
  'Munich',
  'Hamburg',
  'Singapore',
  'Dublin',
  'Auckland',
  'Nairobi',
  'Lagos',
  'Ulaanbaatar',
  'Accra',
  'Johannesburg'
]

const CATEGORIES = [
  'Dentist',
  'Hair Salon',
  'Lawyer',
  'Accountant',
  'Plumber',
  'Restaurant',
  'Physiotherapist',
  'Veterinarian',
  'Real Estate Agent',
  'Retail Shop',
  'Photographer',
  'Gym',
  'Florist',
  'Bakery',
  'Electrician'
]

/**
 * Calculates the day of year (1-365) for a given date.
 * Used as the rotation seed for deterministic query selection.
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Generates a list of ~20 search queries for Google Places API.
 * Rotates through city × category combinations based on day-of-year,
 * ensuring each daily run targets a different slice.
 *
 * @param date - The date to generate queries for. Defaults to today.
 * @returns An array of exactly 20 query strings (e.g., "Dentist New York").
 */
export function generateDailyQueries(date?: Date): string[] {
  const today = date || new Date()
  const dayOfYear = getDayOfYear(today)

  // Select a rolling window of 5 cities
  const cityWindowSize = 5
  const cityOffset = dayOfYear % CITIES.length
  const selectedCities = []
  for (let i = 0; i < cityWindowSize; i++) {
    selectedCities.push(CITIES[(cityOffset + i) % CITIES.length])
  }

  // Select a rolling window of 4 categories
  const categoryWindowSize = 4
  const categoryOffset = dayOfYear % CATEGORIES.length
  const selectedCategories = []
  for (let i = 0; i < categoryWindowSize; i++) {
    selectedCategories.push(CATEGORIES[(categoryOffset + i) % CATEGORIES.length])
  }

  // Generate all combinations: 5 cities × 4 categories = 20 queries
  const queries: string[] = []
  for (const category of selectedCategories) {
    for (const city of selectedCities) {
      queries.push(`${category} ${city}`)
    }
  }

  return queries
}

import { describe, it, expect } from 'vitest'
import { generateDailyQueries } from '../../src/discovery/query-generator.js'

describe('generateDailyQueries', () => {
  it('returns exactly 20 queries for any given date', () => {
    const date1 = new Date('2024-01-15')
    const queries1 = generateDailyQueries(date1)
    expect(queries1).toHaveLength(20)

    const date2 = new Date('2024-06-20')
    const queries2 = generateDailyQueries(date2)
    expect(queries2).toHaveLength(20)

    const date3 = new Date('2024-12-31')
    const queries3 = generateDailyQueries(date3)
    expect(queries3).toHaveLength(20)
  })

  it('returns strings in format "Category City"', () => {
    const date = new Date('2024-01-15')
    const queries = generateDailyQueries(date)

    const categories = [
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

    const cities = [
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

    const validCategories = new Set(categories)
    const validCities = new Set(cities)

    queries.forEach((query) => {
      // Should be in format "Category City"
      const parts = query.split(' ')
      expect(parts.length).toBeGreaterThanOrEqual(2)

      // Reconstruct to handle multi-word categories/cities
      let foundValid = false
      for (const category of categories) {
        for (const city of cities) {
          if (query === `${category} ${city}`) {
            foundValid = true
            break
          }
        }
        if (foundValid) break
      }
      expect(foundValid).toBe(true)
    })
  })

  it('different dates return different queries', () => {
    const date1 = new Date('2024-01-01')
    const queries1 = generateDailyQueries(date1)

    const date2 = new Date('2024-02-15')
    const queries2 = generateDailyQueries(date2)

    // The sets should be different
    const set1 = new Set(queries1)
    const set2 = new Set(queries2)

    // They should not be identical
    const isIdentical = set1.size === set2.size && queries1.every((q) => set2.has(q))
    expect(isIdentical).toBe(false)
  })

  it('same date always returns the same queries (deterministic)', () => {
    const date = new Date('2024-03-15')

    const queries1 = generateDailyQueries(date)
    const queries2 = generateDailyQueries(date)
    const queries3 = generateDailyQueries(new Date('2024-03-15'))

    expect(queries1).toEqual(queries2)
    expect(queries2).toEqual(queries3)
  })

  it('works when called with no arguments (defaults to today)', () => {
    const queriesWithoutArg = generateDailyQueries()
    const queriesWithToday = generateDailyQueries(new Date())

    expect(queriesWithoutArg).toHaveLength(20)
    // Both should return the same queries (both use today's date)
    expect(queriesWithoutArg).toEqual(queriesWithToday)
  })
})

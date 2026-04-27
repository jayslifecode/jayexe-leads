import { describe, it, expect, vi, afterEach } from 'vitest'
import { scoreDesignPath } from '../../src/evaluation/path-b-design.js'

afterEach(() => vi.restoreAllMocks())

describe('scoreDesignPath', () => {
  it('gives low score to old non-mobile site', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        lighthouseResult: {
          categories: { performance: { score: 0.22 } },
          audits: { viewport: { score: 0 } }
        }
      })
    } as Response)

    const result = await scoreDesignPath('https://old-site.com', 2015, false)
    expect(result.score).toBeLessThan(50)
    expect(result.isLead).toBe(true)
    expect(result.flagReason).toBe('outdated_website')
  })

  it('gives high score to modern mobile-friendly site', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        lighthouseResult: {
          categories: { performance: { score: 0.88 } },
          audits: { viewport: { score: 1 } }
        }
      })
    } as Response)

    const result = await scoreDesignPath('https://modern-site.com', 2023, true)
    expect(result.score).toBeGreaterThanOrEqual(50)
    expect(result.isLead).toBe(false)
  })

  it('flags broken site when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))
    const result = await scoreDesignPath('https://broken.com', null, false)
    expect(result.flagReason).toBe('broken_website')
    expect(result.score).toBe(5)
    expect(result.isLead).toBe(true)
  })
})

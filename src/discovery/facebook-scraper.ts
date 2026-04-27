import { chromium, type Page } from 'playwright'
import type { DiscoveredBusiness } from '../types.js'

export async function scrapeFacebookPage(
  pageUrl: string
): Promise<Partial<DiscoveredBusiness>> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(pageUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })

    const bodyText = (await page.textContent('body')) ?? ''

    const name = await extractName(page)
    const phone = extractPhone(bodyText)
    const email = extractEmail(bodyText)
    const lastPostDaysAgo = await extractLastPostAge(page)
    const followerCount = extractFollowerCount(bodyText)
    const respondsToMessages = /responds? (quickly|within|to messages)/i.test(
      bodyText
    )

    return {
      name: name || undefined,
      phone,
      email,
      facebook_page_url: pageUrl,
      facebook_last_post_days_ago: lastPostDaysAgo,
      facebook_follower_count: followerCount,
      facebook_responds_to_messages: respondsToMessages,
    }
  } finally {
    await browser.close()
  }
}

async function extractName(page: Page): Promise<string> {
  try {
    const nameText = await page.$eval('h1', el => el.textContent?.trim() ?? '')
    return nameText
  } catch {
    return ''
  }
}

function extractPhone(text: string): string | null {
  const match = text.match(/\+?[\d\s\-().]{7,20}/)
  return match ? match[0].trim() : null
}

function extractEmail(text: string): string | null {
  const match = text.match(
    /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/
  )
  return match ? match[0] : null
}

async function extractLastPostAge(page: Page): Promise<number | null> {
  try {
    const timeEl = await page.$(
      'time, [data-testid="story-timestamp"] abbr'
    )
    if (!timeEl) return null

    const datetime = await timeEl.getAttribute('datetime')
    if (!datetime) return null

    const postDate = new Date(datetime)
    if (isNaN(postDate.getTime())) return null

    return Math.floor((Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

function extractFollowerCount(text: string): number | null {
  const match = text.match(/([\d,]+)\s*(followers|people follow)/i)
  if (!match) return null
  return parseInt(match[1].replace(/,/g, ''), 10)
}

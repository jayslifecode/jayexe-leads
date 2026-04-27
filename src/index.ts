import { generateDailyQueries } from './discovery/query-generator.js'
import { searchBusinesses } from './discovery/google-places.js'
import { scoreActivityPath } from './evaluation/path-a-activity.js'
import { scoreDesignPath } from './evaluation/path-b-design.js'
import { saveLeads, appendToMaster } from './storage/lead-store.js'
import { generateHtmlReport } from './report/html-report.js'
import { sendTelegramMessage } from './notify/telegram.js'
import type { DiscoveredBusiness, Lead } from './types.js'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const REPO_DIR = process.env.REPO_DIR ?? '.'
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? ''
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID ?? ''
const REVIEW_BASE_URL = process.env.REVIEW_BASE_URL ?? 'https://jayexe-leads.github.io'

async function run(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]!
  console.log(`[${today}] Lead engine starting...`)

  const queries = generateDailyQueries()
  console.log(`Generated ${queries.length} search queries`)

  const discovered: DiscoveredBusiness[] = []
  for (const query of queries) {
    try {
      const results = await searchBusinesses(query, GOOGLE_API_KEY)
      discovered.push(...results)
      console.log(`  ${query} → ${results.length} businesses`)
    } catch (err) {
      console.error(`  ${query} → ERROR: ${err}`)
    }
  }

  console.log(`\nDiscovered ${discovered.length} businesses total. Evaluating...`)

  const leads: Lead[] = []
  for (const business of discovered) {
    const lead = await evaluateBusiness(business, today)
    if (lead) leads.push(lead)
  }

  console.log(`\nFound ${leads.length} leads. Saving...`)

  await saveLeads(leads, today, REPO_DIR)
  await appendToMaster(leads, REPO_DIR)

  const html = generateHtmlReport(leads, today)
  const htmlDir = path.join(REPO_DIR, 'leads')
  await mkdir(htmlDir, { recursive: true })
  await writeFile(path.join(htmlDir, `leads-${today}.html`), html, 'utf-8')

  const reviewUrl = `${REVIEW_BASE_URL}/leads/leads-${today}.html`
  await sendTelegramMessage(
    { botToken: TELEGRAM_TOKEN, chatId: TELEGRAM_CHAT },
    `🔍 <b>Lead Engine — ${today}</b>\n\nFound <b>${leads.length} leads</b> from ${discovered.length} businesses scanned.\n\n📋 <a href="${reviewUrl}">Review here</a>`
  )

  console.log(`Done. Review: ${reviewUrl}`)
}

async function evaluateBusiness(business: DiscoveredBusiness, date: string): Promise<Lead | null> {
  if (!business.website_url) {
    const result = scoreActivityPath(business)
    if (!result.isLead) return null

    return buildLead(business, date, {
      evaluation_path: 'no_website',
      flag_reason: 'no_website',
      score: result.score,
      score_breakdown: result.breakdown,
    })
  }

  const hasContact = !!(business.phone || business.email)
  const result = await scoreDesignPath(business.website_url, null, hasContact)
  if (!result.isLead) return null

  return buildLead(business, date, {
    evaluation_path: 'has_website',
    flag_reason: result.flagReason,
    score: result.score,
    score_breakdown: result.breakdown,
  })
}

function buildLead(
  business: DiscoveredBusiness,
  date: string,
  evaluation: Pick<Lead, 'evaluation_path' | 'flag_reason' | 'score' | 'score_breakdown'>
): Lead {
  return {
    id: randomUUID(),
    date_found: date,
    name: business.name,
    category: business.category,
    location: business.location,
    phone: business.phone,
    email: business.email,
    google_maps_url: business.google_maps_url,
    facebook_page_url: business.facebook_page_url,
    website_url: business.website_url,
    website_screenshot: null,
    demo_url: null,
    demo_created_at: null,
    demo_expires_at: null,
    status: 'pending',
    ...evaluation,
  }
}

run().catch((err: unknown) => {
  console.error('Fatal error:', err)
  process.exit(1)
})

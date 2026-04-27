import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { Lead } from '../types.js'

const LEADS_DIR = 'leads'

export async function saveLeads(
  leads: Lead[],
  date: string,
  dir: string
): Promise<void> {
  const leadsDir = join(dir, LEADS_DIR)
  await mkdir(leadsDir, { recursive: true })

  const filePath = join(leadsDir, `leads-${date}.json`)
  await writeFile(filePath, JSON.stringify(leads, null, 2))
}

export async function loadLeads(date: string, dir: string): Promise<Lead[]> {
  const leadsDir = join(dir, LEADS_DIR)
  const filePath = join(leadsDir, `leads-${date}.json`)

  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

export async function appendToMaster(
  newLeads: Lead[],
  dir: string
): Promise<void> {
  const existing = await loadLeads('master', dir)

  const existingIds = new Set(existing.map((lead) => lead.id))
  const deduplicated = existing.concat(
    newLeads.filter((lead) => !existingIds.has(lead.id))
  )

  await saveLeads(deduplicated, 'master', dir)
}

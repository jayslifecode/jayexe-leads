import type { Lead } from '../types.js'

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (char) => HTML_ESCAPE_MAP[char] || char)
}

export function generateHtmlReport(leads: Lead[], date: string): string {
  const leadCount = leads.length
  const leadRows = leads
    .map((lead) => {
      const contactInfo = []

      if (lead.phone) {
        contactInfo.push(`<strong>Phone:</strong> ${escapeHtml(lead.phone)}`)
      }

      if (lead.email) {
        contactInfo.push(`<strong>Email:</strong> ${escapeHtml(lead.email)}`)
      }

      const links = []

      if (lead.google_maps_url) {
        links.push(
          `<a href="${escapeHtml(lead.google_maps_url)}" target="_blank" rel="noopener noreferrer">Google Maps</a>`
        )
      }

      if (lead.facebook_page_url) {
        links.push(
          `<a href="${escapeHtml(lead.facebook_page_url)}" target="_blank" rel="noopener noreferrer">Facebook</a>`
        )
      }

      if (lead.demo_url) {
        links.push(
          `<a href="${escapeHtml(lead.demo_url)}" target="_blank" rel="noopener noreferrer">Demo Site</a>`
        )
      }

      return `
        <div class="lead-card">
          <div class="lead-header">
            <h2>${escapeHtml(lead.name)}</h2>
            <span class="score">Score: ${lead.score}</span>
          </div>
          <div class="lead-details">
            <p><strong>Category:</strong> ${escapeHtml(lead.category)}</p>
            <p><strong>Location:</strong> ${escapeHtml(lead.location)}</p>
            <p><strong>Flag Reason:</strong> ${escapeHtml(lead.flag_reason)}</p>
            ${contactInfo.length > 0 ? `<p>${contactInfo.join(' | ')}</p>` : ''}
            ${links.length > 0 ? `<p class="links">${links.join(' | ')}</p>` : ''}
          </div>
          <div class="lead-actions">
            <button class="btn btn-approve" data-id="${escapeHtml(lead.id)}">Approve</button>
            <button class="btn btn-reject" data-id="${escapeHtml(lead.id)}">Reject</button>
          </div>
        </div>
      `
    })
    .join('')

  const noLeadsMessage =
    leads.length === 0
      ? '<div class="no-leads-message"><p>No leads found</p></div>'
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lead Review Report - ${escapeHtml(date)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      background: #1a1a1a;
      color: #e0e0e0;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }

    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      color: #fff;
    }

    .header p {
      color: #999;
      font-size: 14px;
    }

    .lead-card {
      background: #2a2a2a;
      border-left: 4px solid #0066cc;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }

    .lead-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .lead-header h2 {
      font-size: 20px;
      color: #fff;
      margin: 0;
    }

    .score {
      background: #0066cc;
      color: #fff;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 14px;
    }

    .lead-details {
      margin-bottom: 15px;
    }

    .lead-details p {
      margin-bottom: 8px;
      color: #d0d0d0;
      font-size: 14px;
      line-height: 1.6;
    }

    .lead-details strong {
      color: #fff;
    }

    .links {
      margin-top: 10px !important;
    }

    .links a {
      color: #0066cc;
      text-decoration: none;
      margin-right: 15px;
    }

    .links a:hover {
      text-decoration: underline;
    }

    .lead-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #444;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-approve {
      background: #28a745;
      color: #fff;
    }

    .btn-approve:hover {
      background: #218838;
    }

    .btn-reject {
      background: #dc3545;
      color: #fff;
    }

    .btn-reject:hover {
      background: #c82333;
    }

    .no-leads-message {
      background: #2a2a2a;
      border-left: 4px solid #666;
      padding: 20px;
      border-radius: 4px;
      text-align: center;
      color: #999;
    }

    .no-leads-message p {
      font-size: 16px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lead Review Report</h1>
      <p>Date: ${escapeHtml(date)} | Total Leads: ${leadCount}</p>
    </div>
    ${noLeadsMessage || leadRows}
  </div>
</body>
</html>`
}

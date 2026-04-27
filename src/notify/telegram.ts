export interface TelegramConfig {
  botToken: string
  chatId: string
}

export async function sendTelegramMessage(
  config: TelegramConfig,
  message: string
): Promise<void> {
  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: config.chatId, text: message, parse_mode: 'HTML' }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Telegram API error: ${err}`)
  }
}

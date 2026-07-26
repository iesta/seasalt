import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { buildSystemPrompt } from '../src/lib/prompt'
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const buf = readFileSync(join(__dirname, 'test01.jpg'))
const b64 = buf.toString('base64')

const t0 = Date.now()
const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'xiaomi/mimo-v2.5',
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Identifie toutes les cartes visibles sur la photo ci-dessous.' },
          { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } }
        ]
      }
    ],
    max_tokens: 8192,
    temperature: 0
  })
})
const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
const d = await res.json()
console.log('Status:', res.status, '| Time:', elapsed + 's')
console.log('Full response:', JSON.stringify(d, null, 2).slice(0, 2000))
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { buildSystemPrompt } from '../src/lib/prompt'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const TEST_DIR = __dirname
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const API_KEY = process.env.OPENROUTER_API_KEY ?? ''
const MODEL = 'google/gemini-2.5-flash'
const DELAY_MS = 2000

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'])

function extractJson(text: string): unknown {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) {
    cleaned = cleaned.slice(start, end + 1)
  }
  return JSON.parse(cleaned)
}

async function main() {
  if (!API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not set')
    process.exit(1)
  }

  const files = readdirSync(TEST_DIR)
    .filter(f => IMAGE_EXTS.has(extname(f).toLowerCase()))
    .sort()

  for (const file of files) {
    const imagePath = join(TEST_DIR, file)
    const outPath = join(TEST_DIR, file.replace(/\.[^.]+$/, '') + '-response.json')

    console.log(`📸 ${file}`)
    const buffer = readFileSync(imagePath)
    const b64 = buffer.toString('base64')
    const ext = extname(imagePath).replace('.', '').toLowerCase()
    const mime = ext === 'jpg' ? 'jpeg' : ext
    const dataUrl = `data:image/${mime};base64,${b64}`

    const body = {
      model: MODEL,
      messages: [
        { role: 'system' as const, content: buildSystemPrompt() },
        {
          role: 'user' as const,
          content: [
            { type: 'text', text: 'Identifie toutes les cartes visibles sur la photo ci-dessous.' },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ],
      temperature: 0
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const t = await res.text().catch(() => '')
      console.log(`  ❌ ${res.status}: ${t.slice(0, 200)}`)
      continue
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content ?? ''
    const parsed = extractJson(raw)
    writeFileSync(outPath, JSON.stringify(parsed, null, 2))
    console.log(`  → ${outPath} (${parsed.cards?.length ?? '?'} cards)`)

    await new Promise(r => setTimeout(r, DELAY_MS))
  }

  console.log('\ndone')
}

main()
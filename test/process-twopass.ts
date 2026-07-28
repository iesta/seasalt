import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { buildSystemPrompt } from '../src/lib/prompt'
import { computeColorDistribution, score } from '../src/lib/scoring'
import type { Card, CardColor, CardType } from '../src/lib/types'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const TEST_DIR = __dirname
const CSV_PATH = join(TEST_DIR, 'tests-twopass.csv')
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const API_KEY = process.env.OPENROUTER_API_KEY ?? ''
const MODEL = process.env.OPENROUTER_MODEL ?? 'google/gemini-3.5-flash-lite'
const DELAY_MS = 2000
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'])

const COUNT_PROMPT = `Combien de cartes (rectangles à bord blanc) vois-tu sur cette photo ?
Réponds UNIQUEMENT avec un nombre, rien d'autre. Exemple: 11`

interface DetectedCardRaw { type?: string; color?: string }

function extractJson(text: string): unknown {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) cleaned = cleaned.slice(start, end + 1)
  return JSON.parse(cleaned)
}

async function call(messages: { role: string; content: unknown }[]): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 4096, temperature: 0 })
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${t.slice(0, 300)}`)
  }
  const d = await res.json()
  return d.choices?.[0]?.message?.content ?? ''
}

function normalizeCard(raw: DetectedCardRaw, i: number): Card {
  return { id: `c${i}`, type: (raw.type ?? 'unknown') as CardType, color: (raw.color ?? 'white') as CardColor }
}

async function main() {
  if (!API_KEY) { console.error('❌ OPENROUTER_API_KEY not set'); process.exit(1) }

  const files = readdirSync(TEST_DIR).filter(f => IMAGE_EXTS.has(extname(f).toLowerCase())).sort()
  const limitIdx = process.argv.indexOf('--limit')
  const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1], 10) : files.length
  const slice = files.slice(0, limit)

  if (!files.length) { console.error('❌ No images'); process.exit(1) }

  console.log(`\n🧪 Two-Pass Benchmark`)
  console.log(`   Pass 1: compter les cartes`)
  console.log(`   Pass 2: classifier les N cartes`)
  console.log(`   Modèle: ${MODEL}`)
  console.log(`   Images: ${slice.length}\n`)

  writeFileSync(CSV_PATH, 'image,pass1_count,card_count,score,dominant_color_name,dominant_color_count\n')

  for (let i = 0; i < slice.length; i++) {
    const file = slice[i]
    const imagePath = join(TEST_DIR, file)
    const buf = readFileSync(imagePath).toString('base64')
    const ext = extname(imagePath).replace('.', '').toLowerCase()
    const mime = ext === 'jpg' ? 'jpeg' : ext
    const dataUrl = `data:image/${mime};base64,${buf}`
    const userMsg = { type: 'text' as const, text: '' }
    const imgMsg = { type: 'image_url' as const, image_url: { url: dataUrl } }

    console.log(`[${i + 1}/${slice.length}] 📸 ${file}`)
    const t0 = Date.now()

    // ----- PASS 1: COUNT -----
    console.log(`   → Pass 1: comptage...`)
    let rawCount = await call([
      { role: 'user', content: [imgMsg, { type: 'text', text: COUNT_PROMPT }] }
    ])
    const pass1Count = parseInt(rawCount.replace(/[^0-9]/g, ''), 10)
    const t1 = Date.now()
    const targetCount = isNaN(pass1Count) || pass1Count < 1 ? undefined : pass1Count
    console.log(`   → Pass 1: ${targetCount ?? '?'} cartes (${((t1 - t0) / 1000).toFixed(1)}s, raw: "${rawCount.trim().slice(0, 50)}")`)

    // ----- PASS 2: CLASSIFY -----
    const classifyPrompt = targetCount
      ? `Il y a EXACTEMENT ${targetCount} cartes sur cette photo. Tu dois en lister EXACTEMENT ${targetCount}. Utilise les pictogrammes, nombres et symboles ColorADD pour identifier chaque carte.`
      : 'Identifie toutes les cartes visibles sur la photo ci-dessous, une par une.'

    console.log(`   → Pass 2: classification (${targetCount ?? '?'} cibles)...`)
    const classifyRes = await call([
      { role: 'system', content: buildSystemPrompt() },
      {
        role: 'user',
        content: [
          imgMsg,
          { type: 'text', text: classifyPrompt }
        ]
      }
    ])
    const t2 = Date.now()
    console.log(`   → Pass 2: ${((t2 - t1) / 1000).toFixed(1)}s`)

    let cards: Card[] = []
    try {
      const parsed = extractJson(classifyRes) as { cards?: DetectedCardRaw[] }
      cards = (parsed.cards ?? []).map(normalizeCard)
    } catch (e) {
      console.log(`   ❌ JSON parse error: ${e}`)
      console.log(`   RAW: ${classifyRes.slice(0, 300)}`)
    }

    const result = score(cards)
    const colors = computeColorDistribution(cards)
    const dom = colors[0]

    console.log(`   📊 Pass 1: ${targetCount ?? '?'} → Détecté: ${cards.length} | Score: ${result.total} | Dom: ${dom?.label ?? '?'}(${dom?.count ?? 0})`)
    const types: Record<string, number> = {}
    for (const c of cards) types[c.type] = (types[c.type] ?? 0) + 1
    console.log(`   📋 Types: ${Object.entries(types).map(([t, c]) => `${t}×${c}`).join(', ')}`)
    console.log()

    const row = [file, targetCount ?? '?', cards.length, result.win ? 'WIN' : result.total, dom?.label ?? '?', dom?.count ?? 0]
    writeFileSync(CSV_PATH, row.join(',') + '\n', { flag: 'a' })

    if (i < slice.length - 1) await new Promise(r => setTimeout(r, DELAY_MS))
  }

  console.log(`✅ ${CSV_PATH}`)
}

main()
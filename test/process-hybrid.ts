import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { buildSystemPrompt } from '../src/lib/prompt'
import { computeColorDistribution, score } from '../src/lib/scoring'
import type { Card, CardColor, CardType } from '../src/lib/types'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const TEST_DIR = __dirname
const CSV_PATH = join(TEST_DIR, 'tests-hybrid.csv')
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const API_KEY = process.env.OPENROUTER_API_KEY ?? ''
const MODEL = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-pro'
const DELAY_MS = 2000

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'])

interface DetectedCardRaw {
  type?: string
  color?: string
}

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

function normalizeCard(raw: DetectedCardRaw, index: number): Card {
  const type = (raw.type ?? 'unknown') as CardType
  const color = (raw.color ?? 'white') as CardColor
  return { id: `c${index}`, type, color }
}

async function processImage(imagePath: string): Promise<Card[]> {
  const imageBuffer = readFileSync(imagePath)
  const base64 = imageBuffer.toString('base64')
  const ext = extname(imagePath).replace('.', '').toLowerCase()
  const mimeType = ext === 'jpg' ? 'jpeg' : ext
  const dataUrl = `data:image/${mimeType};base64,${base64}`

  const systemPrompt = buildSystemPrompt()

  const body = {
    model: MODEL,
    messages: [
      { role: 'system' as const, content: systemPrompt },
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

  console.log(`  → Envoi à ${MODEL}...`)
  const t0 = Date.now()

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  const content: string = data.choices?.[0]?.message?.content ?? ''
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`  → Réponse en ${elapsed}s`)

  const parsed = extractJson(content) as { cards?: DetectedCardRaw[] }
  const rawCards = Array.isArray(parsed.cards) ? parsed.cards : []

  console.log(`  → JSON: ${JSON.stringify(parsed).slice(0, 200)}`)

  return rawCards.map(normalizeCard)
}

function escapeCsv(val: string | number): string {
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

async function main() {
  if (!API_KEY) {
    console.error('❌ OPENROUTER_API_KEY non définie. export OPENROUTER_API_KEY=sk-or-v1-...')
    process.exit(1)
  }

  const files = readdirSync(TEST_DIR)
    .filter(f => IMAGE_EXTS.has(extname(f).toLowerCase()))
    .sort()

  if (files.length === 0) {
    console.error('❌ Aucune image dans test/.')
    process.exit(1)
  }

  console.log(`\n🧪 Seasalt Hybrid Benchmark`)
  console.log(`   LLM   : identifie les cartes (pas le score)`)
  console.log(`   Score : scoring.ts (déterministe, 31 tests)`)
  console.log(`   Modèle: ${MODEL}`)
  console.log(`   Images: ${files.length}\n`)
  console.log('='.repeat(60) + '\n')

  const csvHeader = 'image,card_count,score,dominant_color_name,dominant_color_count'
  writeFileSync(CSV_PATH, csvHeader + '\n')

  let totalApi = 0
  const tStart = Date.now()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const imagePath = join(TEST_DIR, file)
    console.log(`[${i + 1}/${files.length}] 📸 ${file}`)

    try {
      const cards = await processImage(imagePath)
      const result = score(cards)
      const colors = computeColorDistribution(cards)
      const dominant = colors[0]

      const row = [
        escapeCsv(file),
        cards.length,
        result.win ? 'WIN' : result.total,
        escapeCsv(dominant?.label ?? '—'),
        dominant?.count ?? 0
      ]
      writeFileSync(CSV_PATH, row.join(',') + '\n', { flag: 'a' })

  console.log(`  📊 Cartes: ${cards.length}`)
  console.log(`  🎯 Score scoring.ts: ${result.total}`)
  if (result.lines.length > 0) {
    console.log(`     Lignes: ${result.lines.map(l => `${l.label}=${l.points}`).join(', ')}`)
  }
  console.log(`  🎨 Dominant: ${dominant?.label ?? '—'} (${dominant?.count ?? 0})`)
  const typeCounts: Record<string, number> = {}
  for (const c of cards) { typeCounts[c.type] = (typeCounts[c.type] ?? 0) + 1 }
  console.log(`  📋 Types: ${Object.entries(typeCounts).map(([t, c]) => `${t}×${c}`).join(', ')}`)
  console.log()
      totalApi++
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.log(`  ❌ ${msg}\n`)
      writeFileSync(CSV_PATH, `"${file}",ERROR,ERROR,ERROR,ERROR\n`, { flag: 'a' })
    }

    if (i < files.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_MS))
    }
  }

  const totalTime = ((Date.now() - tStart) / 1000).toFixed(0)
  console.log('='.repeat(60))
  console.log(`✅ ${totalApi}/${files.length} images traitées en ${totalTime}s`)
  console.log(`📄 ${CSV_PATH}\n`)
}

main()
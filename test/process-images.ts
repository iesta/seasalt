import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const TEST_DIR = __dirname
const CSV_PATH = join(TEST_DIR, 'tests.csv')
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const API_KEY = process.env.OPENROUTER_API_KEY ?? ''
const MODEL = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-pro'
const DELAY_MS = 2000

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'])

const RULES_PROMPT = `Tu es un expert du jeu de cartes Sea Salt & Paper (Bombyx, 2022). Ta tâche : analyser une photo de cartes et calculer TOUT toi-même.

ÉTAPE 1 — Identifie toutes les cartes visibles sur la photo.
Parcours de gauche à droite, haut en bas. Compte chaque carte.

ÉTAPE 2 — Calcule le score selon les règles officielles :

DUOS (paires = 1 pt chacune, jouées ou gardées en main) :
- Crabe (crab) + Crabe = 1 pt
- Bateau (boat) + Bateau = 1 pt
- Poisson (fish) + Poisson = 1 pt
- Nageur (swimmer) + Requin (shark) = 1 pt

COLLECTIONNEURS (barème progressif) :
- Coquillage (shell) : 1→0, 2→2, 3→4, 4→6, 5→8, 6→10
- Pieuvre (octopus) : 1→0, 2→3, 3→6, 4→9, 5→12
- Pingouin (penguin) : 1→1, 2→3, 3→5
- Marin (sailor) : 1→0, 2→5

MULTIPLICATEURS :
- Phare (lighthouse) : 1 pt par bateau possédé
- Banc de poissons (shoal) : 1 pt par poisson possédé
- Colonie de pingouins (colony) : 2 pts par pingouin possédé
- Capitaine (captain) : 3 pts par marin possédé

SIRÈNES (mermaid, toujours couleur blanche) :
- Chaque sirène rapporte 1 pt par carte de la couleur la plus représentée (hors blanc/sirènes)
- S'il y a N sirènes, prendre les N couleurs les plus représentées (sirène 1 = 1ère couleur, sirène 2 = 2ème couleur...)
- 4 sirènes = victoire immédiate (score = "WIN")

ÉTAPE 3 — Couleur dominante :
Identifie la couleur la plus représentée (hors blanc) et donne son nombre de cartes.

RÉPONDS UNIQUEMENT avec ce JSON (pas de markdown, pas de commentaire) :
{
  "card_count": 12,
  "score": 15,
  "dominant_color_name": "bleu clair",
  "dominant_color_count": 5
}`

interface LlmResult {
  card_count?: number
  score?: number | string
  dominant_color_name?: string
  dominant_color_count?: number
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

async function processImage(imagePath: string): Promise<LlmResult> {
  const imageBuffer = readFileSync(imagePath)
  const base64 = imageBuffer.toString('base64')
  const ext = extname(imagePath).replace('.', '').toLowerCase()
  const mimeType = ext === 'jpg' ? 'jpeg' : ext
  const dataUrl = `data:image/${mimeType};base64,${base64}`

  const body = {
    model: MODEL,
    messages: [
      { role: 'system' as const, content: RULES_PROMPT },
      {
        role: 'user' as const,
        content: [
          { type: 'text', text: 'Analyse cette photo de cartes Sea Salt & Paper.' },
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

  const result = extractJson(content) as LlmResult
  return result
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
    console.error('❌ Aucune image dans test/. Ajoute des .png/.jpg/.webp.')
    process.exit(1)
  }

  console.log(`\n🧪 Seasalt Benchmark`)
  console.log(`   Modèle : ${MODEL}`)
  console.log(`   Images : ${files.length}`)
  console.log(`   Clé API : ${API_KEY.slice(0, 12)}...`)
  console.log(`   Prompt  : LLM calcule tout (pas scoring.ts)`)
  console.log(`   Délai   : ${DELAY_MS / 1000}s entre appels\n`)
  console.log('='.repeat(60) + '\n')

  const csvHeader = 'image,card_count,score,dominant_color_name,dominant_color_count'
  writeFileSync(CSV_PATH, csvHeader + '\n')

  let totalApi = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const imagePath = join(TEST_DIR, file)
    console.log(`[${i + 1}/${files.length}] 📸 ${file}`)

    try {
      const result = await processImage(imagePath)

      const row = [
        escapeCsv(file),
        result.card_count ?? '?',
        result.score ?? '?',
        escapeCsv(result.dominant_color_name ?? '?'),
        result.dominant_color_count ?? '?'
      ]
      writeFileSync(CSV_PATH, row.join(',') + '\n', { flag: 'a' })

      console.log(`  📊 Cartes: ${result.card_count}`)
      console.log(`  🎯 Score:  ${result.score}`)
      console.log(`  🎨 Dominant: ${result.dominant_color_name} (${result.dominant_color_count} cartes)\n`)
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

  console.log('='.repeat(60))
  console.log(`✅ ${totalApi}/${files.length} images traitées`)
  console.log(`📄 ${CSV_PATH}\n`)
}

main()

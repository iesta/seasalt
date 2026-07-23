import type { Card, CardColor, CardType } from './types'
import { buildSystemPrompt } from './prompt'

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface OpenRouterModel {
  id: string
  name?: string
  architecture?: {
    input_modalities?: string[]
  }
}

export interface OpenRouterError extends Error {
  status?: number
}

export async function fetchVisionModels(apiKey?: string): Promise<{ id: string; name: string }[]> {
  const headers: Record<string, string> = {}
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  const res = await fetch('https://openrouter.ai/api/v1/models', { headers })
  if (!res.ok) {
    const err = new Error(`Échec /models: ${res.status} ${res.statusText}`) as OpenRouterError
    err.status = res.status
    throw err
  }
  const data = await res.json()
  const models = (data.data ?? []) as OpenRouterModel[]
  return models
    .filter(m => m.architecture?.input_modalities?.includes('image'))
    .map(m => ({ id: m.id, name: m.name ?? m.id }))
    .sort((a, b) => a.name.localeCompare(b.name))
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

interface DetectedCardRaw {
  type?: string
  color?: string
}

function normalizeCard(raw: DetectedCardRaw, index: number): Card {
  const type = (raw.type ?? 'unknown') as CardType
  const color = (raw.color ?? 'white') as CardColor
  return {
    id: `det-${index}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    color
  }
}

export async function detectCards(
  apiKey: string,
  model: string,
  imageDataUrl: string,
  referenceImageUrl?: string
): Promise<Card[]> {
  const systemPrompt = buildSystemPrompt()

  const userContent: Array<
    { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
  > = [
    { type: 'text', text: 'Identifie toutes les cartes visibles sur la photo ci-dessous.' },
    { type: 'image_url', image_url: { url: imageDataUrl } }
  ]

  if (referenceImageUrl) {
    userContent.push({
      type: 'text',
      text: 'Pour référence, voici une planche du livret de règles officiel montrant les 14 types de cartes:'
    })
    userContent.push({ type: 'image_url', image_url: { url: referenceImageUrl } })
  }

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ],
    temperature: 0
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`) as OpenRouterError
    err.status = res.status
    throw err
  }

  const data = await res.json()
  const content: string = data.choices?.[0]?.message?.content ?? ''

  let parsed: { cards?: DetectedCardRaw[] }
  try {
    parsed = extractJson(content) as { cards?: DetectedCardRaw[] }
  } catch {
    const err = new Error('Réponse LLM illisible (JSON invalide)') as OpenRouterError
    throw err
  }

  const rawCards = Array.isArray(parsed.cards) ? parsed.cards : []
  return rawCards.map(normalizeCard)
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
    reader.readAsDataURL(file)
  })
}

export async function loadReferenceImage(): Promise<string> {
  const url = `${import.meta.env.BASE_URL}cards/rulebook-reference.png`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Impossible de charger l'image de référence: ${res.status}`)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

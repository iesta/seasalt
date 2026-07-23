import type { CardColor, CardType } from './types'
import { CARD_COLORS, CARD_TYPE_LABELS, CARD_TYPE_META } from './types'

const COLOR_DESCRIPTIONS: Record<CardColor, string> = {
  yellow: 'jaune',
  green: 'vert',
  pink: 'rose',
  purple: 'violet',
  lightblue: 'bleu clair',
  darkblue: 'bleu foncé',
  black: 'noir',
  gray: 'gris',
  white: 'blanc'
}

const TYPE_DESCRIPTIONS: Record<CardType, string> = {
  crab: 'Crabe — origami de crabe. Symbole ColorADD sur la carte.',
  boat: 'Bateau — origami de petit bateau/papier.',
  fish: 'Poisson — origami de poisson.',
  swimmer: 'Nageur — origami de figure humaine en train de nager.',
  shark: 'Requin — origami de requin.',
  shell: 'Coquillage — origami de coquille (type palourde).',
  octopus: 'Pieuvre — origami de poulpe/octopus.',
  penguin: 'Pingouin — origami de pingouin.',
  sailor: 'Marin — origami de marin avec casquette.',
  lighthouse: 'Phare — origami de phare.',
  shoal: 'Banc de poissons — origami représentant plusieurs petits poissons ensemble.',
  colony: 'Colonie de pingouins — origami de plusieurs pingouins ensemble.',
  captain: 'Capitaine — origami de capitaine avec barbe/casquette.',
  mermaid: 'Sirène — origami de sirène. Couleur blanche par défaut.',
  unknown: 'Carte non identifiée.'
}

export function buildSystemPrompt(): string {
  const typeLines = Object.entries(CARD_TYPE_META)
    .filter(([t]) => t !== 'unknown')
    .map(([t, meta]) => {
      const type = t as CardType
      return `- ${type} (${CARD_TYPE_LABELS[type]}, catégorie: ${meta.category}, ${meta.count} dans le deck): ${TYPE_DESCRIPTIONS[type]}`
    })
    .join('\n')

  const colorLines = CARD_COLORS.map(c => `- ${c} (${COLOR_DESCRIPTIONS[c]})`).join('\n')

  return `Tu es un assistant expert dans le jeu de cartes Sea Salt & Paper (Bombyx, 2022).
Ton rôle: identifier les cartes visibles sur une photo et les retourner dans un format JSON strict.

TYPES DE CARTES POSSIBLES (14 types, base game uniquement, pas d'expansion):
${typeLines}

COULEURS POSSIBLES (9 couleurs, la sirène est toujours blanche):
${colorLines}

Chaque carte porte un symbole ColorADD en bas à droite qui aide à identifier la couleur de manière non-ambiguë (utile si l'éclairage est mauvais). Si tu hésites entre deux couleurs, utilise le symbole ColorADD.

RÈGLES D'IDENTIFICATION:
- Compte TOUTES les cartes visibles sur la photo (cartes en main + cartes posées devant le joueur).
- Une carte = une entrée dans la liste.
- Si tu ne reconnais pas une carte, utilise type "unknown".
- Si tu ne peux pas déterminer la couleur, choisis la plus probable.
- Ne déduis rien, ne calcule rien, liste uniquement les cartes observées.

FORMAT DE RÉPONSE (JSON strict, sans markdown, sans commentaire):
{
  "cards": [
    { "type": "crab", "color": "yellow" },
    { "type": "boat", "color": "darkblue" }
  ]
}`
}

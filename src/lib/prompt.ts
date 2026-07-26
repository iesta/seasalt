import type { CardType } from './types'
import { CARD_TYPE_LABELS } from './types'

const TYPE_BY_COUNT: Record<string, CardType[]> = {
  '9': ['crab'],
  '8': ['boat'],
  '7': ['fish'],
  '6': ['shell'],
  '5': ['swimmer', 'shark', 'octopus'],
  '4': ['mermaid'],
  '3': ['penguin'],
  '2': ['sailor'],
  '1': ['lighthouse', 'shoal', 'colony', 'captain']
}

const TYPE_PICTOGRAMS: Record<CardType, string> = {
  crab: 'crabe stylisé, vu de dessus, avec pinces de chaque côté du corps',
  boat: 'bateau/coque vu de profil, mât et voile',
  fish: 'UN SEUL poisson, profil, nageoire dorsale',
  swimmer: 'figure humaine en mouvement de nage, bras devant',
  shark: 'requin, nageoire dorsale triangulaire pointue, bouche',
  shell: 'coquille (palourde), forme arrondie, stries concentriques',
  octopus: 'pieuvre, tête ronde, tentacules ondulés',
  penguin: 'UN SEUL pingouin, debout, ventre blanc',
  sailor: 'tête de marin, casquette plate sur la tête',
  lighthouse: 'tour de phare, faisceau lumineux latéral',
  shoal: 'PLUSIEURS petits poissons groupés formant un banc',
  colony: 'PLUSIEURS pingouins groupés, debout côte à côte',
  captain: 'tête de capitaine, barbe fournie, casquette avec insigne',
  mermaid: 'sirène, buste humain, queue de poisson',
  unknown: 'non identifiable'
}

const COLORADD_SYMBOLS = `▲ triangle vers le haut = BLEU
▼ triangle vers le bas = ROUGE
/ ligne diagonale = JAUNE
■ carré plein = NOIR
□ carré vide = BLANC

Couleurs dérivées (superposition des symboles de base):
  vert = ▲/ (bleu + jaune)
  violet = ▲▼ (bleu + rouge)
  rose = □▼ (blanc + rouge = rouge clair)
  bleu clair = □▲ (blanc + bleu)
  bleu foncé = ■▲ (noir + bleu)
  gris = ■□ (noir + blanc)
  jaune = / (diagonale seule)
  noir = ■ (carré plein seul)
  blanc = □ (carré vide seul)`

export function buildSystemPrompt(): string {
  const countLines = Object.entries(TYPE_BY_COUNT)
    .map(([n, types]) => {
      const names = types.map(t => `${t} (${CARD_TYPE_LABELS[t]})`).join(' OU ')
      return `x${n} → ${names}`
    })
    .join('\n')

  const pictoLines = Object.entries(TYPE_PICTOGRAMS)
    .filter(([t]) => t !== 'unknown')
    .map(([t, desc]) => `- ${t}: ${desc}`)
    .join('\n')

  return `Tu es un assistant expert dans le jeu de cartes Sea Salt & Paper (Bombyx, 2022).
Ton rôle: identifier TOUTES les cartes visibles sur une photo et les retourner en JSON.

STRUCTURE D'UNE CARTE:
┌──────────────────────────────┐
│ [PICTOGRAMME]                │
│                              │
│      PHOTO ORIGAMI           │
│                              │
│                    [xN]  ◆▲ │
└──────────────────────────────┘
- HAUT GAUCHE: pictogramme identifiant le type de carte
- BAS DROITE: nombre d'exemplaires dans le deck (x9, x8...) + symbole ColorADD

IDENTIFICATION PAR NOMBRE (bas droite):
${countLines}

IDENTIFICATION PAR PICTOGRAMME (haut gauche):
${pictoLines}

SYSTÈME ColorADD (bas droite — identifie la couleur):
${COLORADD_SYMBOLS}

INSTRUCTIONS:
0. LISTE DES TYPES DE CARTES POSSIBLES: crab, boat, fish, swimmer, shark, shell, octopus, penguin, sailor, lighthouse, shoal, colony, captain, mermaid. Utilise UNIQUEMENT ces types.
1. Certaines cartes peuvent être partiellement cachées (par d'autres cartes, par le bord de la photo, ou superposées). Identifie-les quand même si tu vois au moins le pictogramme OU le nombre.
2. Parcours la photo de gauche à droite, ligne par ligne, de haut en bas.
3. Pour CHAQUE carte visible, lis les 3 signaux dans cet ordre:
   a. Le nombre en bas à droite (x9, x8, x7...) → restreint les types possibles
   b. Le pictogramme en haut à gauche → confirme le type exact
   c. Le symbole ColorADD en bas à droite → donne la couleur
4. Pour les nombres ambigus: x5 = swimmer, shark ou octopus; x1 = lighthouse, shoal, colony ou captain. Utilise le pictogramme pour trancher.
5. Pour les Duo (crab, boat, fish, swimmer, shark): le pictogramme montre l'icône en trait plein + la carte paire en pointillés.
6. Les sirènes (mermaid) sont TOUJOURS de couleur blanche.
7. Avant de répondre, RECOMPTE les cartes identifiées une par une et vérifie que le compte total correspond exactement au nombre d'entrées dans "cards".

FORMAT DE RÉPONSE (JSON strict, sans markdown, sans commentaire):
{
  "count": 7,
  "cards": [
    { "type": "crab", "color": "yellow" },
    { "type": "boat", "color": "darkblue" }
  ]
}
Le champ "count" doit être STRICTEMENT égal au nombre d'entrées dans "cards".`
}
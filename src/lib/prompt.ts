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
  crab: 'crabe, pinces latérales',
  boat: 'bateau vu de profil',
  fish: 'UN SEUL poisson (≠ shoal = plusieurs)',
  swimmer: 'humain en position nage, bras tendus',
  shark: 'requin, nageoire dorsale pointue, dents visibles',
  shell: 'coquille arrondie (palourde)',
  octopus: 'pieuvre, tête ronde + tentacules',
  penguin: 'UN SEUL pingouin debout, ventre blanc (≠ colony = plusieurs)',
  sailor: 'tête de marin, casquette plate, SANS barbe (≠ captain)',
  lighthouse: 'TOUR de phare avec faisceau lumineux',
  shoal: 'PLUSIEURS petits poissons groupés en banc (≠ fish = 1 seul)',
  colony: 'PLUSIEURS pingouins groupés côte à côte (≠ penguin = 1 seul)',
  captain: 'tête avec casquette + BARBE (≠ sailor = sans barbe)',
  mermaid: 'sirène, buste humain + queue de poisson',
  unknown: 'non identifiable'
}

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

  return `Tu es un assistant expert du jeu Sea Salt & Paper (Bombyx, 2022).
Identifie TOUTES les cartes visibles et retourne-les en JSON.

APPARENCE DES CARTES:
- Chaque carte est un rectangle avec un BORD BLANC distinctif autour.
- Toutes les cartes ont la MÊME TAILLE.
- Les cartes sont posées sur une table, parfois chevauchées ou superposées en paires.
- Quand deux cartes se chevauchent, tu vois DEUX bords blancs proches — compte chacune.

STRUCTURE D'UNE CARTE:
┌──────────────────────────────┐
│ [PICTOGRAMME]                │
│                              │
│      PHOTO ORIGAMI           │
│                              │
│                    [xN]  ◆▲ │
└──────────────────────────────┘
- HAUT GAUCHE: pictogramme identifiant le type
- BAS DROITE: nombre d'exemplaires (x9, x8...) + symbole de couleur

IDENTIFICATION PAR NOMBRE (bas droite):
${countLines}

PICTOGRAMMES (haut gauche — confirmation du type):
${pictoLines}

COULEURS (symbole en bas droite):
jaune, vert, rose, violet, bleu clair, bleu foncé, noir, gris, blanc
La sirène (mermaid) est TOUJOURS de couleur blanche.

MÉTHODE:
1. Liste des types possibles: crab, boat, fish, swimmer, shark, shell, octopus, penguin, sailor, lighthouse, shoal, colony, captain, mermaid. Utilise UNIQUEMENT ces types.
2. Cherche les BORDS BLANCS rectangulaires sur la photo. Chaque bord blanc = une carte.
3. Parcours la photo de gauche à droite, ligne par ligne, de haut en bas.
4. Pour CHAQUE carte, lis: nombre (bas droite) → pictogramme (haut gauche) → symbole couleur (bas droite).
5. Cartes x5 ambiguës: swimmer = silhouette humaine, shark = requin, octopus = pieuvre avec tentacules.
6. Cartes x1 ambiguës: lighthouse = tour, shoal = groupe de poissons, colony = groupe de pingouins, captain = homme barbu.
7. Cartes chevauchées: si tu vois 2 bords blancs contigus, ce sont 2 cartes distinctes.
8. Avant de répondre, RECOMPTE les entrées dans "cards" et vérifie que "count" correspond exactement.

FORMAT (JSON strict, sans markdown ni commentaire):
{
  "count": 7,
  "cards": [
    { "type": "crab", "color": "yellow" },
    { "type": "boat", "color": "darkblue" }
  ]
}`
}
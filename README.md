# Seasalt — Compteur Sea Salt & Paper

Webapp (PWA) qui compte les points d'une main de **Sea Salt & Paper** à partir d'une photo.

## Usage

1. `npm install`
2. `npm run dev` → http://localhost:5173/seasalt/
3. Ouvrir les Réglages (⚙), coller une clé API [OpenRouter](https://openrouter.ai/keys), choisir un modèle vision.
4. Photographier la main → score calculé.

## Comment ça marche

- La photo + une planche de référence (livret de règles officiel) sont envoyées à un LLM vision via OpenRouter.
- Le LLM retourne la liste des cartes détectées en JSON.
- Le moteur de scoring (`src/lib/scoring.ts`) calcule le score de manière déterministe selon les règles officielles.
- L'UI permet de corriger les cartes détectées (erreurs LLM) avant calcul.

## Scripts

- `npm run dev` — serveur de dev
- `npm run build` — build prod
- `npm test` — tests du scoring (Vitest)
- `npm run typecheck` — vérification TypeScript

## Déploiement

GitHub Pages via `.github/workflows/deploy.yml`. Le build utilise `base: '/seasalt/'`.

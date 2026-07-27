# Seasalt — Comparaison des modèles

## Tableau complet

| Image | Modèle | Cartes | Score | Dominant | Temps |
|---|---|---|---|---|---|
| **test01** | Gemini 3.6 Flash | 11 | 11 | Jaune (2) | ~26s |
| | Gemini 3.5 Flash Lite | 10 | 11 | Blanc (2) | ~5s |
| | Gemini 2.5 Flash | 12 | 13 | Bleu foncé (3) | ~6s |
| | GPT-4o-mini | 8 | 6 | Blanc (2) | ~7s |
| | GLM-4.6v | 10 | — | — | ~8s |
| **test02** | Gemini 3.6 Flash | 14 | 8 | Noir (4) | ~18s |
| | Gemini 3.5 Flash Lite | 14 | 9 | Bleu foncé (3) | ~10s |
| | Gemini 2.5 Flash | 14 | 10 | Noir (4) | ~9s |
| | GPT-4o-mini | 10 | 3 | — (2) | ~8s |
| | GLM-4.6v | 10 | — | — | ~8s |
| **test03** | Gemini 3.6 Flash | 14 | 14 | Vert (3) | ~42s |
| | Gemini 3.5 Flash Lite | 15 | 15 | Vert (3) | ~10s |
| | Gemini 2.5 Flash | 14 | 13 | Noir (4) | ~10s |
| **test04** | Gemini 3.5 Flash Lite | 16 | 18 | Noir (5) | ~9s |
| | Gemini 2.5 Flash | 14 | 11 | Noir (3) | ~10s |
| **test05** | Gemini 3.5 Flash Lite | 15 | 21 | Bleu foncé (8) | ~7s |
| | Gemini 2.5 Flash | 15 | 17 | Noir (4) | ~11s |
| **test06** | Gemini 3.6 Flash | 3 | 7 | Vert (1) | ~13s |
| | Gemini 3.5 Flash Lite | 3 | 7 | Vert (1) | ~7s |
| | Gemini 2.5 Flash | 3 | 3 | Vert (1) | ~10s |
| **test07** | Gemini 3.5 Flash Lite | 2 | 3 | Rose (1) | ~7s |
| | Gemini 2.5 Flash | 2 | 0 | Rose (1) | ~9s |
| **test08** | Gemini 3.6 Flash | 5 | 4 | Rose (1) | ~13s |
| | Gemini 3.5 Flash Lite | 5 | 4 | Rose (1) | ~6s |
| | Gemini 2.5 Flash | 5 | 4 | Rose (1) | ~9s |
| **test09** | Gemini 3.5 Flash Lite | 10 | 8 | Noir (3) | ~6s |
| | Gemini 2.5 Flash | 10 | 8 | Noir (3) | ~10s |

## Synthèse

| Modèle | Test01 | Test02 | Test06 | Test08 | Score moyen | Temps moyen |
|---|---|---|---|---|---|---|
| **Gemini 3.6 Flash** | **11** ★ | **14** ★ | 3 | 5 | **10.8** | ~25s |
| Gemini 3.5 Flash Lite | 10 | 14 ★ | 3 | 5 | 9.8 | **~7s** |
| Gemini 2.5 Flash | 12 | 14 ★ | 3 | 5 | 9.7 | ~9s |
| GPT-4o-mini | 8 ✗ | 10 ✗ | — | — | 5.7 | ~7s |
| GLM-4.6v | 10 | 10 ✗ | — | — | — | ~8s |

- ★ = meilleur résultat pour cette image
- Scores calculés via `scoring.ts` (identique pour tous les modèles)

## Recommandation

| Besoin | Modèle |
|---|---|
| Précision max | `google/gemini-3.6-flash` |
| Rapidité + correct | `google/gemini-3.5-flash-lite` |
| Équilibre | `google/gemini-3.6-flash` |
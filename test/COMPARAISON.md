# Seasalt — Comparaison des modèles

## Tableau complet

| Image | Modèle | Cartes | Score | Dominant | Temps |
|---|---|---|---|---|---|
| **test01** | **Gemini 3.6 Flash** | **11** | **11** | Jaune (2) | ~26s |
| | Gemini 3.5 Flash Lite v1 | 10 | 11 | Blanc (2) | ~5s |
| | Gemini 3.5 Flash Lite v2 | 10 | 11 | Jaune (2) | ~6s |
| | Gemini 3.5 Flash Lite 2-pass | 10 | 11 | Bleu foncé (2) | ~13s |
| | Gemini 2.5 Flash | 12 | 13 | Bleu foncé (3) | ~6s |
| | GPT-4o-mini | 8 | 6 | Blanc (2) | ~7s |
| | GLM-4.6v | 10 | — | — | ~8s |
| **test02** | **Gemini 3.6 Flash** | 14 | 8 | Noir (4) | ~18s |
| | Gemini 3.5 Flash Lite v1 | 14 | 9 | Bleu foncé (3) | ~10s |
| | Gemini 3.5 Flash Lite v2 | **16** | 13 | Bleu foncé (4) | ~11s |
| | Gemini 3.5 Flash Lite 2-pass | 14 | 8 | Vert (3) | ~19s |
| | Gemini 2.5 Flash | 14 | 10 | Noir (4) | ~9s |
| | GPT-4o-mini | 10 | 3 | — (2) | ~8s |
| | GLM-4.6v | 10 | — | — | ~8s |
| **test03** | **Gemini 3.6 Flash** | 14 | 14 | Vert (3) | ~42s |
| | Gemini 3.5 Flash Lite v1 | 15 | 15 | Vert (3) | ~10s |
| | Gemini 3.5 Flash Lite v2 | 14 | 14 | Noir (4) | ~10s |
| | Gemini 2.5 Flash | 14 | 13 | Noir (4) | ~10s |
| **test04** | Gemini 3.5 Flash Lite v1 | 16 | 18 | Noir (5) | ~9s |
| | Gemini 3.5 Flash Lite v2 | 13 | 11 | Noir (3) | ~8s |
| | Gemini 2.5 Flash | 14 | 11 | Noir (3) | ~10s |
| **test05** | Gemini 3.5 Flash Lite v1 | 15 | 21 | Bleu foncé (8) | ~7s |
| | Gemini 3.5 Flash Lite v2 | 16 | 20 | Noir (5) | ~11s |
| | Gemini 2.5 Flash | 15 | 17 | Noir (4) | ~11s |
| **test06** | Gemini 3.6 Flash | 3 | 7 | Vert (1) | ~13s |
| | Gemini 3.5 Flash Lite v1 | 3 | 7 | Vert (1) | ~7s |
| | Gemini 3.5 Flash Lite v2 | 3 | 7 | Vert (1) | ~8s |
| | Gemini 2.5 Flash | 3 | 3 | Vert (1) | ~10s |
| **test07** | Gemini 3.5 Flash Lite v1 | 2 | 3 | Rose (1) | ~7s |
| | Gemini 3.5 Flash Lite v2 | 2 | 3 | Rose (1) | ~11s |
| | Gemini 2.5 Flash | 2 | 0 | Rose (1) | ~9s |
| **test08** | Gemini 3.6 Flash | 5 | 4 | Rose (1) | ~13s |
| | Gemini 3.5 Flash Lite v1 | 5 | 4 | Rose (1) | ~6s |
| | Gemini 3.5 Flash Lite v2 | 5 | 4 | Rose (1) | ~10s |
| | Gemini 2.5 Flash | 5 | 4 | Rose (1) | ~9s |
| **test09** | Gemini 3.5 Flash Lite v1 | 10 | 8 | Noir (3) | ~6s |
| | Gemini 3.5 Flash Lite v2 | 11 | 12 | Noir (4) | ~10s |
| | Gemini 2.5 Flash | 10 | 8 | Noir (3) | ~10s |

## Synthèse

| Modèle | Test01 | Test02 | Test03 | Test06 | Test08 | Score moyen | Temps moyen |
|---|---|---|---|---|---|---|---|
| **Gemini 3.6 Flash** | **11** ★ | 14 | **14** ★ | 3 | 5 | 10.8 | ~25s |
| **3.5 Lite v2** | 10 | 16 | **14** ★ | 3 | 5 | 10.3 | ~9s |
| 3.5 Lite v1 | 10 | 14 | 15 | 3 | 5 | 9.8 | ~7s |
| 2.5 Flash | 12 | 14 | 14 | 3 | 5 | 9.7 | ~9s |

## Observations prompt v2 vs v1

- test01: inchangé (10 cartes, toujours 1 sous 3.6)
- test02: **16** (+2) → LLM voit plus de cartes, peut-être surcomptage
- test03: **14** (-1) → meilleur alignement avec 3.6
- test06-08: identique
- test09: **11** (+1) → amélioration

Le prompt v2 a amélioré test03 et test09, mais pas test01. Le bord blanc aide mais ne résout pas le sous-comptage des cartes partiellement cachées. Pour test01, il manque probablement 1 carte qui est très chevauchée.

## Résultat two-pass

L'approche deux passes (compter puis classifier) n'a pas amélioré les résultats par rapport au single-pass v2. Le comptage (pass 1) est lui-même imprécis (le modèle ne peut pas compter les bords blancs de manière fiable). Le gain de temps est négligeable (2× le coût API pour le même résultat).

| Test | Pass 1 (comptage) | Détecté final | Δ |
|---|---|---|---|
| test01 | 10 | 10 | 0 |
| test02 | 13 | 14 | +1 |
| test03 | 16 | 14 | -2 |
| test05 | 17 | 15 | -2 |
| test09 | 11 | 10 | -1 |

## Recommandation

| Besoin | Modèle |
|---|---|
| Précision max | `google/gemini-3.6-flash` |
| Rapide + correct | `google/gemini-3.5-flash-lite` (prompt v2) |
| Équilibre | `google/gemini-3.5-flash-lite` (prompt v2) |
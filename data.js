// Catalogue des matières / assistants IA spécialisés
const ASSISTANTS = [
  {
    id: "maths",
    name: "Tuteur Mathématiques",
    subject: "Mathématiques",
    icon: "📐",
    color: "#6366f1",
    model: "studia-math-1",
    description:
      "Algèbre, géométrie, analyse, probabilités. Explique les démonstrations pas à pas et propose des exercices ciblés.",
    intro:
      "Bonjour ! Je suis ton tuteur de maths. Sur quel chapitre veux-tu travailler aujourd'hui ?",
    suggestions: [
      "Comment fonctionne le théorème de Pythagore ?",
      "Donne-moi un exercice sur les dérivées.",
      "Résous x² − 5x + 6 = 0 en m'expliquant.",
    ],
  },
  {
    id: "physique",
    name: "Tuteur Physique-Chimie",
    subject: "Physique-Chimie",
    icon: "⚗️",
    color: "#0ea5e9",
    model: "studia-phys-1",
    description:
      "Mécanique, électricité, optique, réactions chimiques. Calculs guidés avec unités et schémas.",
    intro: "Salut ! Physique ou chimie aujourd'hui ?",
    suggestions: [
      "Explique la deuxième loi de Newton.",
      "Comment équilibrer une équation chimique ?",
      "Un exercice sur la loi d'Ohm, niveau lycée.",
    ],
  },
  {
    id: "francais",
    name: "Tuteur Français",
    subject: "Français",
    icon: "📖",
    color: "#ec4899",
    model: "studia-fr-1",
    description:
      "Analyse littéraire, grammaire, dissertation, commentaire composé. Aide à structurer et argumenter.",
    intro:
      "Bonjour ! Je peux t'aider pour la grammaire, l'analyse ou la rédaction. Que veux-tu travailler ?",
    suggestions: [
      "Comment structurer un commentaire composé ?",
      "Analyse la métaphore dans : « Mon enfant, ma sœur, songe à la douceur »",
      "Différence entre métonymie et synecdoque ?",
    ],
  },
  {
    id: "histoire",
    name: "Tuteur Histoire-Géographie",
    subject: "Histoire-Géo",
    icon: "🌍",
    color: "#f59e0b",
    model: "studia-hg-1",
    description:
      "Dates clés, mécanismes historiques, cartes, dissertation. Réponses sourcées et chronologiques.",
    intro: "Bonjour ! Histoire ou géographie ? Quel chapitre ?",
    suggestions: [
      "Causes de la Première Guerre mondiale ?",
      "Plan pour une compo sur la Guerre froide.",
      "Différence entre métropolisation et urbanisation ?",
    ],
  },
  {
    id: "svt",
    name: "Tuteur SVT",
    subject: "SVT",
    icon: "🧬",
    color: "#10b981",
    model: "studia-svt-1",
    description:
      "Biologie cellulaire, génétique, géologie, écologie. Schémas et exemples concrets du programme.",
    intro: "Bonjour ! Sur quel sujet de SVT veux-tu progresser ?",
    suggestions: [
      "Explique la méiose simplement.",
      "Comment se forment les montagnes ?",
      "Qu'est-ce qu'un écosystème ?",
    ],
  },
  {
    id: "anglais",
    name: "Tuteur Anglais",
    subject: "Anglais",
    icon: "🇬🇧",
    color: "#3b82f6",
    model: "studia-en-1",
    description:
      "Grammaire, vocabulaire, expression écrite et orale. Corrections détaillées avec règles.",
    intro: "Hi! Do you want to practice grammar, vocabulary or writing today?",
    suggestions: [
      "Différence entre present perfect et past simple ?",
      "Corrige mon texte en anglais.",
      "Vocabulaire pour parler du climat.",
    ],
  },
  {
    id: "philo",
    name: "Tuteur Philosophie",
    subject: "Philosophie",
    icon: "🧠",
    color: "#8b5cf6",
    model: "studia-philo-1",
    description:
      "Dissertation, explication de texte, notions du programme. Aide à problématiser et argumenter.",
    intro: "Bonjour. Quelle notion ou quel auteur veux-tu explorer ?",
    suggestions: [
      "Aide-moi à problématiser : « La liberté est-elle une illusion ? »",
      "Résume la pensée de Kant sur le devoir.",
      "Plan pour une explication de texte de Descartes.",
    ],
  },
  {
    id: "info",
    name: "Tuteur Informatique",
    subject: "Informatique",
    icon: "💻",
    color: "#14b8a6",
    model: "studia-cs-1",
    description:
      "Algorithmique, Python, structures de données, bases de SQL. Explique le code ligne à ligne.",
    intro: "Salut ! Sur quel langage ou concept veux-tu travailler ?",
    suggestions: [
      "Explique la récursivité avec un exemple.",
      "Différence entre liste et tuple en Python ?",
      "Donne-moi un exercice de tri à blanc.",
    ],
  },
];

const COURSES = [
  {
    id: "c1",
    title: "Équations du second degré",
    subject: "Mathématiques",
    level: "Lycée",
    chapter: "Algèbre",
    duration: "45 min",
    assistant: "maths",
    summary: "Discriminant, racines, factorisation : tout pour résoudre ax² + bx + c = 0.",
    content: `# Équations du second degré

Une **équation du second degré** s'écrit sous la forme :

**ax² + bx + c = 0**, avec a ≠ 0.

## Méthode du discriminant

Le discriminant vaut **Δ = b² − 4ac**. On distingue trois cas :

- Si **Δ > 0** : deux solutions réelles distinctes, x = (−b ± √Δ) / 2a
- Si **Δ = 0** : une solution double, x = −b / 2a
- Si **Δ < 0** : aucune solution réelle

## Exemple guidé

Résolvons \`x² − 5x + 6 = 0\` :

1. a = 1, b = −5, c = 6
2. Δ = 25 − 24 = 1 (positif)
3. x₁ = (5 − 1) / 2 = **2** et x₂ = (5 + 1) / 2 = **3**

## Factorisation

Si Δ ≥ 0, on peut factoriser : **ax² + bx + c = a(x − x₁)(x − x₂)**.

## À retenir

Vérifie toujours le **signe** de a avant de conclure sur les variations du polynôme.`,
  },
  {
    id: "c2",
    title: "Dérivées et variations",
    subject: "Mathématiques",
    level: "Lycée",
    chapter: "Analyse",
    duration: "60 min",
    assistant: "maths",
    summary: "Nombre dérivé, fonctions dérivées, sens de variation.",
    content: `# Dérivées et variations

La **dérivée** d'une fonction en un point mesure son taux de variation instantané.

## Règles essentielles

- (xⁿ)' = n·x^(n−1)
- (sin x)' = cos x
- (cos x)' = −sin x
- (eˣ)' = eˣ
- (ln x)' = 1/x

## Opérations sur les dérivées

- (u + v)' = u' + v'
- (uv)' = u'v + uv'
- (u/v)' = (u'v − uv') / v²

## Variations

Le signe de f'(x) détermine le sens de variation de f :

- f'(x) > 0 sur un intervalle ⟹ f y est **croissante**
- f'(x) < 0 ⟹ f y est **décroissante**
- f'(x) = 0 et change de signe ⟹ **extremum local**

## Exemple

Pour f(x) = x² − 4x + 3, f'(x) = 2x − 4 s'annule en x = 2 : minimum en (2, −1).`,
  },
  {
    id: "c3",
    title: "Probabilités conditionnelles",
    subject: "Mathématiques",
    level: "Supérieur",
    chapter: "Probabilités",
    duration: "50 min",
    assistant: "maths",
    summary: "Formule de Bayes, indépendance, arbres pondérés.",
    content: `# Probabilités conditionnelles

La probabilité de A **sachant** B vaut :

**P(A | B) = P(A ∩ B) / P(B)**, si P(B) > 0.

## Formule des probabilités totales

Si (B₁, …, Bₙ) forme une partition de l'univers :

P(A) = Σᵢ P(A | Bᵢ) · P(Bᵢ)

## Formule de Bayes

**P(B | A) = P(A | B) · P(B) / P(A)**

Très utile en diagnostic médical : on connaît P(test+ | malade) et on veut P(malade | test+).

## Indépendance

A et B sont indépendants si P(A ∩ B) = P(A) · P(B), c'est-à-dire **P(A | B) = P(A)**.

## Astuce

Trace systématiquement un **arbre pondéré** : les branches portent les probas conditionnelles, et chaque chemin donne une probabilité jointe par produit.`,
  },
  {
    id: "c4",
    title: "Lois de Newton",
    subject: "Physique-Chimie",
    level: "Lycée",
    chapter: "Mécanique",
    duration: "55 min",
    assistant: "physique",
    summary: "Inertie, principe fondamental, action-réaction.",
    content: `# Les trois lois de Newton

## 1ʳᵉ loi — Principe d'inertie

Dans un référentiel galiléen, un corps **isolé** ou **pseudo-isolé** conserve sa vitesse vectorielle (immobile ou en MRU).

## 2ᵉ loi — Principe fondamental de la dynamique

**ΣF⃗ = m · a⃗**

La somme vectorielle des forces extérieures appliquées à un solide de masse m est égale au produit de la masse par son accélération.

## 3ᵉ loi — Action-réaction

Si un corps A exerce une force F⃗ₐ→ᵦ sur B, alors B exerce sur A une force F⃗ᵦ→ₐ telle que :

**F⃗ₐ→ᵦ = − F⃗ᵦ→ₐ**

## Méthode de résolution

1. Définir le **système** et le **référentiel**.
2. Faire le **bilan des forces** (poids, réaction du support, tension, etc.).
3. Appliquer la 2ᵉ loi de Newton.
4. Projeter sur les axes choisis.

## Unités

Force en **N** (newton), masse en **kg**, accélération en **m/s²**. Toujours vérifier l'homogénéité.`,
  },
  {
    id: "c5",
    title: "Réactions acide-base",
    subject: "Physique-Chimie",
    level: "Lycée",
    chapter: "Chimie",
    duration: "40 min",
    assistant: "physique",
    summary: "Couples acide/base, pH, équilibres, titrage.",
    content: `# Réactions acide-base

## Définition de Brønsted

Un **acide** cède un proton H⁺. Une **base** capte un proton.

À chaque acide correspond une base conjuguée : couple **HA / A⁻**.

## pH et concentrations

**pH = −log [H₃O⁺]**

- Solution acide : pH < 7
- Solution neutre : pH = 7 (à 25 °C)
- Solution basique : pH > 7

## Constante d'acidité

Pour le couple HA / A⁻ : **Ka = [A⁻][H₃O⁺] / [HA]**, et **pKa = −log Ka**.

## Diagramme de prédominance

- Si pH < pKa : forme acide HA prédomine
- Si pH > pKa : forme basique A⁻ prédomine

## Titrage acide fort / base forte

À l'équivalence : nₐcide = nᵦase. Saut de pH brutal, repérable au virage d'un indicateur coloré.`,
  },
  {
    id: "c6",
    title: "Le commentaire composé",
    subject: "Français",
    level: "Lycée",
    chapter: "Méthodologie",
    duration: "35 min",
    assistant: "francais",
    summary: "Structure, axes d'étude, problématique, rédaction.",
    content: `# Le commentaire composé — méthode

## 1. Lecture et repérage

Lis le texte **plusieurs fois**. Identifie :

- le genre, le registre, le mouvement littéraire
- les procédés frappants (figures de style, rythme, lexique)
- les thèmes récurrents

## 2. Problématique

Formule une question qui éclaire à la fois le **sens** et la **forme** du texte. Évite les "Quels sont les procédés…" plats.

## 3. Plan en deux ou trois axes

Chaque axe doit :

- avoir un titre interprétatif (pas descriptif)
- être divisé en sous-parties
- s'appuyer sur des **citations** courtes et précises

## 4. Rédaction

- Introduction : présentation, situation, problématique, annonce de plan
- Développement : un § par sous-partie, analyse + citation + interprétation
- Conclusion : bilan + ouverture

## À éviter

La **paraphrase** (raconter le texte) et le **catalogue de procédés** sans interprétation.`,
  },
  {
    id: "c7",
    title: "Les figures de style",
    subject: "Français",
    level: "Collège",
    chapter: "Stylistique",
    duration: "30 min",
    assistant: "francais",
    summary: "Métaphore, métonymie, anaphore, oxymore et autres figures clés.",
    content: `# Figures de style essentielles

## Figures d'analogie

- **Comparaison** : rapproche deux éléments via un outil (« comme », « tel »). *Doux comme un agneau.*
- **Métaphore** : comparaison sans outil. *Cette femme est un soleil.*
- **Personnification** : attribue des traits humains à un non-humain. *Le vent murmure.*

## Figures de substitution

- **Métonymie** : remplace un terme par un autre lié (contenu/contenant, cause/effet). *Boire un verre.*
- **Synecdoque** : tout par la partie, ou inverse. *Une voile à l'horizon.*

## Figures d'insistance

- **Anaphore** : répétition en début de phrase. *Moi, président de la République, je…*
- **Gradation** : succession en intensité croissante ou décroissante.

## Figures d'opposition

- **Antithèse** : oppose deux termes. *Je vis, je meurs.*
- **Oxymore** : alliance de contraires. *Une obscure clarté.*`,
  },
  {
    id: "c8",
    title: "La Première Guerre mondiale",
    subject: "Histoire-Géo",
    level: "Lycée",
    chapter: "XXe siècle",
    duration: "50 min",
    assistant: "histoire",
    summary: "1914-1918 : causes, étapes, bilan d'une guerre totale.",
    content: `# La Première Guerre mondiale (1914-1918)

## Causes lointaines

- **Rivalités impériales** : France/Allemagne (Alsace-Lorraine), tensions balkaniques
- **Système d'alliances** : Triple-Entente / Triple-Alliance
- **Montée des nationalismes** en Europe

## Cause immédiate

**28 juin 1914** : assassinat de l'archiduc François-Ferdinand à Sarajevo. Engrenage des alliances en quelques semaines.

## Trois grandes phases

1. **Guerre de mouvement** (août–déc. 1914) : invasion de la Belgique, bataille de la Marne.
2. **Guerre de position** (1915–1917) : tranchées, batailles industrielles (Verdun, la Somme).
3. **Sortie de guerre** (1918) : entrée des États-Unis, offensives finales, armistice du **11 novembre**.

## Caractère de guerre totale

- Mobilisation économique et industrielle
- Mobilisation des esprits (propagande, censure)
- Brutalisation des sociétés

## Bilan

~10 millions de morts, traumatisme durable. Le **traité de Versailles** (1919) redessine l'Europe et porte en germe les conflits suivants.`,
  },
  {
    id: "c9",
    title: "La métropolisation",
    subject: "Histoire-Géo",
    level: "Lycée",
    chapter: "Géographie",
    duration: "40 min",
    assistant: "histoire",
    summary: "Définition, dynamiques et impacts d'une concentration urbaine planétaire.",
    content: `# La métropolisation

## Définition

Processus de **concentration** des populations, des activités économiques et des fonctions de commandement dans les grandes villes (les **métropoles**).

À distinguer de l'**urbanisation**, qui désigne plus largement la croissance de la population urbaine.

## Manifestations

- Concentration des sièges sociaux, finances, médias, recherche
- Densification du **CBD** (Central Business District)
- Étalement urbain et **périurbanisation**

## Hiérarchie mondiale

Quelques **villes mondiales** dominent (New York, Londres, Tokyo, Paris, Shanghai…). Elles concentrent les flux financiers et culturels.

## Effets

- Inégalités intra-urbaines accrues (gentrification, ségrégation)
- Pression environnementale (transport, étalement, îlots de chaleur)
- Polarisation territoriale : "France des métropoles" vs "France périphérique"`,
  },
  {
    id: "c10",
    title: "La mitose et la méiose",
    subject: "SVT",
    level: "Lycée",
    chapter: "Génétique",
    duration: "45 min",
    assistant: "svt",
    summary: "Deux divisions cellulaires fondamentales, mais pas pour la même chose.",
    content: `# Mitose et méiose

## Mitose

Division cellulaire produisant **deux cellules filles identiques** à la cellule mère (2n → 2n).

Quatre phases : **prophase**, métaphase, anaphase, **télophase**. Sert à la croissance et au renouvellement des tissus.

## Méiose

Deux divisions successives produisant **quatre cellules haploïdes** (2n → n). Spécifique aux gamètes.

- **Méiose I** (réductionnelle) : séparation des chromosomes homologues
- **Méiose II** (équationnelle) : séparation des chromatides sœurs

## Brassages génétiques

- **Brassage interchromosomique** : répartition aléatoire des chromosomes homologues en méiose I
- **Brassage intrachromosomique** : crossing-over entre chromatides

Ces brassages expliquent la **diversité génétique** des gamètes, donc des descendants.`,
  },
  {
    id: "c11",
    title: "Tectonique des plaques",
    subject: "SVT",
    level: "Lycée",
    chapter: "Géologie",
    duration: "50 min",
    assistant: "svt",
    summary: "La Terre est mobile : dorsales, subduction, collision.",
    content: `# Tectonique des plaques

La lithosphère terrestre est découpée en une douzaine de **plaques** qui se déplacent de quelques centimètres par an.

## Trois types de frontières

- **Divergente** : dorsales océaniques, création de croûte
- **Convergente** : subduction (plaque dense plonge) ou collision (deux continents)
- **Transformante** : coulissage latéral (faille de San Andreas)

## Indices

- Symétrie des **anomalies magnétiques** de part et d'autre des dorsales
- Répartition des **séismes** et **volcans** le long des frontières
- Mesures **GPS** des déplacements

## Moteur

Les **courants de convection** dans le manteau entraînent les plaques. La chaleur interne provient de la radioactivité et de la chaleur initiale.`,
  },
  {
    id: "c12",
    title: "Present perfect vs past simple",
    subject: "Anglais",
    level: "Collège",
    chapter: "Grammaire",
    duration: "25 min",
    assistant: "anglais",
    summary: "Two past tenses, two very different uses.",
    content: `# Present perfect vs past simple

## Past simple

Action **terminée**, datée ou implicitement passée.

- *I **ate** at 8 pm.*
- *She **visited** Paris last year.*

Marqueurs : *yesterday, last week, in 2020, ago*…

## Present perfect

Action **liée au présent** : conséquence, expérience, action récente sans date précise.

- *I **have just eaten**.* (j'ai un effet présent : je n'ai pas faim)
- *She **has visited** Paris.* (elle connaît Paris)

Marqueurs : *just, already, yet, ever, never, since, for*…

## Test rapide

Si on peut placer **"yesterday"** sans changer le sens, c'est du past simple.
Si on peut placer **"so far"**, c'est du present perfect.`,
  },
  {
    id: "c13",
    title: "La liberté chez Kant",
    subject: "Philosophie",
    level: "Lycée",
    chapter: "Notions",
    duration: "55 min",
    assistant: "philo",
    summary: "Liberté, devoir, autonomie : l'éthique kantienne en clair.",
    content: `# La liberté chez Kant

Kant pose une distinction fondamentale entre :

- **Liberté négative** : absence de contrainte extérieure
- **Liberté positive** : capacité à se déterminer soi-même

## Autonomie vs hétéronomie

- **Hétéronomie** : la volonté obéit à des inclinations ou à des forces extérieures
- **Autonomie** : la volonté se donne à elle-même sa propre loi

Être libre, pour Kant, c'est agir par **devoir**, c'est-à-dire par respect de la loi morale qu'on se donne soi-même.

## Impératif catégorique

> « Agis seulement d'après la maxime qui peut en même temps se vouloir comme loi universelle. »

C'est le **critère de moralité** : avant d'agir, je vérifie si ma règle d'action peut être universalisée sans contradiction.

## Conséquences

La vraie liberté n'est donc pas faire ce qu'on veut, mais **vouloir ce que la raison commande**.`,
  },
  {
    id: "c14",
    title: "Introduction à Python",
    subject: "Informatique",
    level: "Lycée",
    chapter: "Programmation",
    duration: "60 min",
    assistant: "info",
    summary: "Variables, conditions, boucles, fonctions : les bases pour démarrer.",
    content: `# Introduction à Python

## Variables et types

\`\`\`python
age = 17              # int
note = 14.5           # float
nom = "Camille"       # str
admis = True          # bool
\`\`\`

## Conditions

\`\`\`python
if note >= 10:
    print("Admis")
elif note >= 8:
    print("Rattrapage")
else:
    print("Recalé")
\`\`\`

## Boucles

\`\`\`python
for i in range(5):
    print(i)

total = 0
while total < 100:
    total += 10
\`\`\`

## Fonctions

\`\`\`python
def carre(x):
    return x * x

print(carre(7))  # 49
\`\`\`

## Bonnes pratiques

- Indentation à **4 espaces** (obligatoire)
- Noms de variables explicites : \`nb_etudiants\` plutôt que \`n\`
- Un commentaire explique le **pourquoi**, pas le **quoi**`,
  },
  {
    id: "c15",
    title: "Algorithmes de tri",
    subject: "Informatique",
    level: "Supérieur",
    chapter: "Algorithmique",
    duration: "70 min",
    assistant: "info",
    summary: "Tri par sélection, insertion, fusion, rapide : comparaisons et complexités.",
    content: `# Algorithmes de tri

## Tri par sélection — O(n²)

À chaque étape, trouver le minimum et le placer en première position non triée.

Simple, mais lent : on parcourt toujours tout le tableau.

## Tri par insertion — O(n²) au pire, O(n) trié

On prend les éléments un par un et on les insère à la bonne place dans la partie triée.

Très efficace sur des données presque triées.

## Tri fusion — O(n log n)

Diviser pour régner :

1. Couper le tableau en deux
2. Trier récursivement chaque moitié
3. Fusionner les deux moitiés triées

Stable, prévisible, mais nécessite de la mémoire supplémentaire.

## Tri rapide (quicksort) — O(n log n) en moyenne

Choisir un **pivot**, partitionner, récurrer. Très rapide en pratique mais O(n²) au pire.

## Quel tri choisir ?

| Cas | Algorithme |
|---|---|
| Données quasi-triées | Insertion |
| Garantie n log n | Fusion |
| Le plus rapide en moyenne | Quicksort |
| Petit tableau (n < 10) | Insertion |`,
  },
];

const EXERCISES = [
  { id: "e1", title: "Résoudre 5 équations du 2nd degré", subject: "Mathématiques", difficulty: "Facile", assistant: "maths", description: "Série de cinq équations à résoudre avec le discriminant.", duration: "20 min", prompt: "J'aimerais m'entraîner sur cinq équations du second degré, peux-tu m'en proposer une pour commencer ?" },
  { id: "e2", title: "Étude d'une fonction polynôme", subject: "Mathématiques", difficulty: "Moyen", assistant: "maths", description: "Domaine, dérivée, variations, tracé.", duration: "40 min", prompt: "Aide-moi à étudier f(x) = x³ − 3x² + 2 : domaine, dérivée, variations, tracé." },
  { id: "e3", title: "Calcul d'intégrales par parties", subject: "Mathématiques", difficulty: "Difficile", assistant: "maths", description: "Quatre intégrales à calculer avec la méthode IPP.", duration: "45 min", prompt: "Rappelle-moi la formule d'intégration par parties et donne-moi un premier exemple à résoudre." },
  { id: "e4", title: "Chute libre d'une bille", subject: "Physique-Chimie", difficulty: "Moyen", assistant: "physique", description: "Mouvement uniformément accéléré, calculer vitesse et temps de chute.", duration: "25 min", prompt: "Une bille tombe d'une hauteur de 10 m sans vitesse initiale. Comment calculer son temps de chute et sa vitesse au sol ?" },
  { id: "e5", title: "Dosage d'un acide faible", subject: "Physique-Chimie", difficulty: "Difficile", assistant: "physique", description: "Courbe de pH, équivalence, pKa.", duration: "40 min", prompt: "Je dois doser un acide faible par la soude. Comment identifier l'équivalence et déterminer le pKa ?" },
  { id: "e6", title: "Commentaire d'un poème de Baudelaire", subject: "Français", difficulty: "Difficile", assistant: "francais", description: "Analyse d'un sonnet des Fleurs du Mal.", duration: "60 min", prompt: "Comment commencer le commentaire d'un sonnet de Baudelaire ? J'ai besoin d'aide pour problématiser." },
  { id: "e7", title: "Identifier 10 figures de style", subject: "Français", difficulty: "Facile", assistant: "francais", description: "Reconnaître métaphore, métonymie, allégorie, etc.", duration: "15 min", prompt: "Propose-moi une phrase et je dois identifier la figure de style." },
  { id: "e8", title: "Carte mentale : causes de 1914", subject: "Histoire-Géo", difficulty: "Moyen", assistant: "histoire", description: "Construire la carte mentale des causes lointaines et immédiates.", duration: "30 min", prompt: "Aide-moi à construire une carte mentale des causes de la Première Guerre mondiale." },
  { id: "e9", title: "Croquis : un littoral touristique", subject: "Histoire-Géo", difficulty: "Moyen", assistant: "histoire", description: "Réaliser un croquis avec légende organisée.", duration: "35 min", prompt: "Comment structurer la légende d'un croquis sur un littoral touristique aménagé ?" },
  { id: "e10", title: "Arbre généalogique et hérédité", subject: "SVT", difficulty: "Moyen", assistant: "svt", description: "Déterminer le mode de transmission d'une maladie génétique.", duration: "30 min", prompt: "Sur un arbre généalogique, comment déterminer si une maladie est dominante ou récessive, autosomique ou liée à l'X ?" },
  { id: "e11", title: "Translate 10 sentences (FR → EN)", subject: "Anglais", difficulty: "Facile", assistant: "anglais", description: "Phrases courtes mêlant present perfect et past simple.", duration: "20 min", prompt: "Give me a first sentence in French to translate into English, mixing present perfect and past simple." },
  { id: "e12", title: "Dissertation : « Suis-je ce que j'ai conscience d'être ? »", subject: "Philosophie", difficulty: "Difficile", assistant: "philo", description: "Sujet classique sur la conscience.", duration: "90 min", prompt: "Aide-moi à problématiser le sujet : « Suis-je ce que j'ai conscience d'être ? »" },
  { id: "e13", title: "Fonctions récursives en Python", subject: "Informatique", difficulty: "Moyen", assistant: "info", description: "Implémenter factorielle, Fibonacci, somme d'une liste.", duration: "35 min", prompt: "Donne-moi un premier exercice de récursivité en Python, en partant de la factorielle." },
  { id: "e14", title: "Requêtes SQL — jointures", subject: "Informatique", difficulty: "Difficile", assistant: "info", description: "INNER JOIN, LEFT JOIN, agrégations.", duration: "40 min", prompt: "Explique-moi la différence entre INNER JOIN et LEFT JOIN avec un exemple concret." },
];

// Réponses ciblées par mots-clés (par assistant)
const SMART_RESPONSES = {
  maths: [
    {
      keywords: ["pythagore"],
      answer: `Le **théorème de Pythagore** s'applique dans un triangle rectangle :

**a² + b² = c²**

où *c* est l'hypoténuse (le côté opposé à l'angle droit), *a* et *b* les deux autres côtés.

## Exemple

Si a = 3 et b = 4 :
- c² = 9 + 16 = 25
- c = **5**

## Réciproque

Si, dans un triangle, on a a² + b² = c², alors ce triangle est rectangle en l'angle opposé à c.`,
    },
    {
      keywords: ["second degré", "discriminant", "delta", "x²", "x^2"],
      answer: `Pour résoudre **ax² + bx + c = 0** :

1. Calculer **Δ = b² − 4ac**
2. Selon le signe :
   - Δ > 0 : deux racines x = (−b ± √Δ) / 2a
   - Δ = 0 : une racine double x = −b / 2a
   - Δ < 0 : pas de racine réelle

## Exemple

x² − 5x + 6 = 0

- Δ = 25 − 24 = 1
- x₁ = (5 − 1) / 2 = **2**
- x₂ = (5 + 1) / 2 = **3**

Tu veux en essayer un toi-même ?`,
    },
    {
      keywords: ["dérivée", "dérivation", "f'"],
      answer: `La **dérivée** mesure la pente locale. Quelques règles clés :

- (xⁿ)' = n·x^(n−1)
- (sin x)' = cos x
- (cos x)' = −sin x
- (eˣ)' = eˣ
- (ln x)' = 1/x

## Opérations

- (u + v)' = u' + v'
- (uv)' = u'v + uv'
- (u/v)' = (u'v − uv') / v²

Quelle fonction veux-tu dériver ?`,
    },
    {
      keywords: ["intégrale", "intégration", "primitive"],
      answer: `Pour intégrer f, on cherche **F telle que F' = f**. Quelques primitives classiques :

- ∫ xⁿ dx = x^(n+1)/(n+1) + C  (si n ≠ −1)
- ∫ 1/x dx = ln|x| + C
- ∫ eˣ dx = eˣ + C
- ∫ cos x dx = sin x + C

## Intégration par parties

\`\`\`
∫ u v' dx = [u v] − ∫ u' v dx
\`\`\`

Donne-moi la fonction à intégrer.`,
    },
    {
      keywords: ["probabilité", "proba", "bayes"],
      answer: `En probabilités conditionnelles :

**P(A | B) = P(A ∩ B) / P(B)**

## Formule de Bayes

P(B | A) = P(A | B) · P(B) / P(A)

Très utile pour les diagnostics : on connaît P(test+ | malade) et on veut P(malade | test+).

Donne-moi un énoncé, on le traite ensemble.`,
    },
  ],
  physique: [
    {
      keywords: ["newton", "force", "principe fondamental"],
      answer: `## Les trois lois de Newton

1. **Inertie** : un corps isolé garde sa vitesse vectorielle constante.
2. **Principe fondamental** : **ΣF⃗ = m · a⃗**
3. **Action-réaction** : F⃗ₐ→ᵦ = − F⃗ᵦ→ₐ

## Méthode

- Définir le système et le référentiel
- Faire le bilan des forces (poids, réaction, frottements…)
- Appliquer la 2ᵉ loi et projeter

Sur quel exercice veux-tu travailler ?`,
    },
    {
      keywords: ["ohm", "tension", "résistance"],
      answer: `**Loi d'Ohm** : pour un conducteur ohmique,

**U = R · I**

- U en volts (V)
- R en ohms (Ω)
- I en ampères (A)

## Puissance

P = U · I = R · I² = U² / R

Tu veux un exercice chiffré ?`,
    },
    {
      keywords: ["chimique", "équation", "équilibrer"],
      answer: `Pour **équilibrer une équation chimique**, on conserve chaque élément. Étapes :

1. Écrire l'équation avec les bonnes formules
2. Compter les atomes de chaque élément à gauche et à droite
3. Placer des coefficients (jamais modifier les indices)
4. Vérifier la conservation des charges

## Exemple

CH₄ + 2 O₂ → CO₂ + 2 H₂O

Donne-moi l'équation à équilibrer.`,
    },
    {
      keywords: ["ph", "acide", "base"],
      answer: `**pH = −log [H₃O⁺]**

- pH < 7 : acide
- pH = 7 : neutre (à 25 °C)
- pH > 7 : basique

## Couple acide/base

Pour HA / A⁻ : **Ka = [A⁻][H₃O⁺] / [HA]** et **pKa = −log Ka**

Sur quoi veux-tu travailler ?`,
    },
  ],
  francais: [
    {
      keywords: ["commentaire", "composé"],
      answer: `## Plan du commentaire composé

1. **Lecture** approfondie et repérage (registre, thèmes, procédés)
2. **Problématique** unifiée fond + forme
3. **Plan** en 2 ou 3 axes, titres interprétatifs
4. **Rédaction** : intro → développement → conclusion

## Conseil

Évite la **paraphrase** et le **catalogue de procédés**. Pour chaque citation, ajoute toujours une **interprétation**.

Donne-moi ton extrait, on peut commencer.`,
    },
    {
      keywords: ["métaphore", "métonymie", "figure", "synecdoque", "oxymore"],
      answer: `Quelques figures à ne pas confondre :

- **Métaphore** : analogie *sans* outil de comparaison. *Cette femme est un soleil.*
- **Métonymie** : substitution par lien logique (contenant/contenu, cause/effet). *Boire un verre.*
- **Synecdoque** : substitution par inclusion (la partie pour le tout). *Une voile à l'horizon.*
- **Oxymore** : alliance de deux termes contraires. *Une obscure clarté.*
- **Anaphore** : répétition en début de phrase / vers.

Tu veux un exemple à analyser ?`,
    },
    {
      keywords: ["dissertation", "plan", "argumentation"],
      answer: `## Plan classique de dissertation littéraire

1. **Introduction** : amorce, présentation du sujet, problématique, plan annoncé
2. **Thèse** : on défend une première lecture du sujet
3. **Antithèse** : on nuance, on objecte
4. **Synthèse** : on dépasse la tension dans une 3ᵉ partie
5. **Conclusion** : bilan + ouverture

Donne-moi le sujet, on construit ensemble.`,
    },
  ],
  histoire: [
    {
      keywords: ["1914", "première guerre", "grande guerre"],
      answer: `## Causes de la Première Guerre mondiale

**Lointaines** :
- Rivalités impériales (Alsace-Lorraine, Balkans)
- Système d'alliances (Triple-Entente / Triple-Alliance)
- Montée des nationalismes

**Immédiate** : assassinat de **François-Ferdinand** à Sarajevo (28 juin 1914) → engrenage des alliances.

## Phases

1. Guerre de mouvement (1914)
2. Guerre de position (1915–1917)
3. Sortie de guerre (1918)

Tu veux un plan détaillé sur un aspect précis ?`,
    },
    {
      keywords: ["guerre froide", "1947", "1991"],
      answer: `## Plan possible — Guerre froide

**I. Un affrontement idéologique (1947–1953)**
- Doctrines Truman / Jdanov
- Blocus de Berlin, OTAN/Pacte de Varsovie

**II. Coexistence et crises (1953–1975)**
- Crise de Cuba, guerre du Vietnam
- Détente, traités SALT

**III. De la nouvelle guerre froide à l'effondrement (1975–1991)**
- Course aux armements de Reagan
- Gorbatchev, chute du Mur, dissolution de l'URSS

Veux-tu approfondir une partie ?`,
    },
    {
      keywords: ["métropolisation", "urbanisation", "métropole"],
      answer: `## Métropolisation ≠ urbanisation

- **Urbanisation** : croissance de la population urbaine
- **Métropolisation** : concentration des fonctions de commandement (sièges sociaux, finance, R&D, culture) dans quelques grandes villes

## Effets

- Hiérarchisation des villes mondiales
- Étalement et périurbanisation
- Inégalités intra-urbaines (gentrification, ségrégation)
- Polarisation territoriale ("France des métropoles" vs France périphérique)`,
    },
  ],
  svt: [
    {
      keywords: ["méiose", "mitose"],
      answer: `## Mitose vs méiose

| | Mitose | Méiose |
|---|---|---|
| Cellules filles | 2, identiques | 4, haploïdes |
| Phases | 1 division | 2 divisions |
| Brassage génétique | Non | **Oui** |
| Rôle | Croissance, renouvellement | Gamètes |

La méiose produit la diversité génétique par **brassages inter- et intrachromosomiques**.`,
    },
    {
      keywords: ["plaque", "tectonique", "subduction", "dorsale"],
      answer: `## Trois types de frontières de plaques

- **Divergente** : dorsales océaniques → création de croûte
- **Convergente** : subduction (plaque dense plonge) ou collision (continents)
- **Transformante** : coulissage (faille de San Andreas)

## Indices

- Anomalies magnétiques symétriques aux dorsales
- Répartition des séismes/volcans
- Mesures GPS

Moteur : convection dans le manteau.`,
    },
    {
      keywords: ["écosystème", "biodiversité"],
      answer: `Un **écosystème** = **biocénose** (vivants) + **biotope** (milieu) en interaction.

## Niveaux d'organisation

- Population : individus d'une même espèce
- Communauté : ensemble des populations d'un milieu
- Écosystème : communauté + facteurs abiotiques

La **biodiversité** se mesure à trois niveaux : génétique, spécifique, écosystémique.`,
    },
  ],
  anglais: [
    {
      keywords: ["present perfect", "past simple"],
      answer: `## Present perfect vs past simple

**Past simple** — finished, dated:
- *I **ate** at 8 pm.*
- Markers: *yesterday, last week, ago, in 2020*

**Present perfect** — linked to now:
- *I **have just eaten**.*
- Markers: *just, already, yet, ever, never, since, for*

## Quick test

If you can add *"yesterday"* → past simple.
If you can add *"so far"* → present perfect.`,
    },
    {
      keywords: ["traduction", "translate", "traduire"],
      answer: `Sure — give me a sentence in French and I'll help you translate it. Or I can give you one to translate.

Here's a starter:

> *« Elle a vécu à Londres pendant cinq ans. »*

Try your translation, I'll check it.`,
    },
    {
      keywords: ["climate", "environment", "climat"],
      answer: `## Useful vocabulary — climate

- **climate change** / global warming
- **greenhouse gas** emissions
- **carbon footprint**
- **renewable energy** (solar, wind, hydro)
- **biodiversity loss**
- **deforestation**
- **sustainable** development

Want a few example sentences?`,
    },
  ],
  philo: [
    {
      keywords: ["liberté", "libre"],
      answer: `## Problématiser la liberté

Tension classique : la liberté semble évidente (je fais ce que je veux), mais elle est aussi **conditionnée** (déterminismes biologiques, sociaux, inconscients).

## Trois pistes

1. **Liberté négative** : absence de contrainte (Hobbes)
2. **Liberté positive** : autonomie de la volonté (Kant)
3. **Liberté en situation** : Sartre, "condamné à être libre"

Quel sujet précis veux-tu travailler ?`,
    },
    {
      keywords: ["kant", "devoir", "impératif"],
      answer: `## Kant — l'impératif catégorique

> « Agis seulement d'après la maxime qui peut en même temps se vouloir comme loi universelle. »

## Idées clés

- **Autonomie** : la volonté se donne sa propre loi morale
- **Devoir** : agir par respect de la loi, non par inclination
- **Bonne volonté** : seul un acte fait *par devoir* a une valeur morale

Veux-tu un exemple d'application ?`,
    },
    {
      keywords: ["explication", "texte", "descartes"],
      answer: `## Méthode — explication de texte

1. **Situer** le texte : auteur, œuvre, contexte philosophique
2. **Dégager** la thèse et le problème
3. **Expliquer linéairement** : suivre la progression de l'argumentation
4. **Discuter** l'enjeu : que rejette/affirme l'auteur ?

Pour Descartes, identifie toujours s'il argue dans le cadre du **doute méthodique** ou après le **cogito**.

Donne-moi le texte, on commence.`,
    },
  ],
  info: [
    {
      keywords: ["récursivité", "recursive", "récursif"],
      answer: `Une **fonction récursive** s'appelle elle-même, avec un **cas de base** qui stoppe la récursion.

## Exemple : factorielle

\`\`\`python
def fact(n):
    if n <= 1:        # cas de base
        return 1
    return n * fact(n - 1)   # appel récursif
\`\`\`

## Attention

- Toujours avoir un cas de base accessible
- Méfie-toi de la profondeur de pile (\`sys.setrecursionlimit\` en Python ≈ 1000)

Tu veux un exercice ?`,
    },
    {
      keywords: ["liste", "tuple", "python"],
      answer: `## Liste vs tuple en Python

- **Liste** : \`[1, 2, 3]\` — **mutable**, on peut ajouter/modifier
- **Tuple** : \`(1, 2, 3)\` — **immuable**, taille et contenu fixés

\`\`\`python
ma_liste = [1, 2]
ma_liste.append(3)   # OK

mon_tuple = (1, 2)
mon_tuple[0] = 9     # TypeError
\`\`\`

On utilise les tuples pour des données fixes (coordonnées, dates) ou comme clés de dictionnaires.`,
    },
    {
      keywords: ["tri", "sort", "algorithme"],
      answer: `## Algorithmes de tri à connaître

| Algo | Moyenne | Pire | Mémoire | Stable |
|---|---|---|---|---|
| Insertion | O(n²) | O(n²) | O(1) | oui |
| Fusion | O(n log n) | O(n log n) | O(n) | oui |
| Quicksort | O(n log n) | O(n²) | O(log n) | non |

Tu veux qu'on implémente le tri par insertion ensemble ?`,
    },
    {
      keywords: ["sql", "jointure", "join"],
      answer: `## INNER JOIN vs LEFT JOIN

- **INNER JOIN** : ne garde que les lignes qui ont une correspondance dans les deux tables
- **LEFT JOIN** : garde **toutes** les lignes de la table de gauche, NULL si pas de correspondance

\`\`\`sql
SELECT e.nom, c.titre
FROM eleves e
LEFT JOIN cours c ON c.id = e.cours_id;
\`\`\`

Ici, un élève sans cours apparaît quand même, avec \`titre = NULL\`.`,
    },
  ],
};

// Réponses de secours quand aucun mot-clé ne matche
const FALLBACK_RESPONSES = {
  maths: [
    "Intéressant ! Peux-tu préciser de quel chapitre il s'agit ? Algèbre, analyse, géométrie, probas ?",
    "On va décomposer ça étape par étape. Donne-moi l'énoncé exact si tu en as un.",
    "Essaie de me dire **ce que tu sais déjà** sur le sujet, je rebondirai dessus.",
  ],
  physique: [
    "Bonne question. Précise si on parle de physique (mécanique, électricité, optique) ou de chimie.",
    "Vérifions d'abord les **unités** et fais-moi le bilan des grandeurs connues.",
    "Tu as un schéma de la situation ? Décris-le-moi.",
  ],
  francais: [
    "Donne-moi l'extrait ou la phrase exacte, je l'analyse avec toi.",
    "C'est de quelle œuvre / quel auteur ? Le contexte change beaucoup l'analyse.",
    "Veux-tu travailler la **forme** (style, procédés) ou le **fond** (thèmes, sens) ?",
  ],
  histoire: [
    "On parle de quelle période exactement ? Donne-moi une date ou un événement repère.",
    "Veux-tu un **plan**, une **fiche de révision** ou une **explication** ?",
    "Précise géographie ou histoire, et le chapitre de ton programme.",
  ],
  svt: [
    "Tu veux qu'on prenne ça à partir du cours ou directement avec un exercice ?",
    "Sois plus précis : biologie cellulaire, génétique, écologie, géologie ?",
    "On peut aussi partir d'un schéma typique du programme si tu veux.",
  ],
  anglais: [
    "Tell me what you'd like to focus on: grammar, vocab, writing, or speaking?",
    "Send me your text and I'll mark mistakes with explanations.",
    "Niveau collège, lycée, prépa ? Je calibre la difficulté.",
  ],
  philo: [
    "Quel auteur, quelle notion ? Précise le sujet exact si tu en as un.",
    "Pour problématiser, on cherche une **tension**. Quelle est la tension de ton sujet ?",
    "Tu veux un plan, une explication de texte ou éclaircir une notion ?",
  ],
  info: [
    "Quel langage utilises-tu ? Python, C, Java, JavaScript ?",
    "Partage ton code (entre triples backticks) et je te le commente ligne par ligne.",
    "On part d'une explication conceptuelle ou directement d'un exercice ?",
  ],
};

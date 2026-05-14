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
    intro: "Bonjour ! Je peux t'aider pour la grammaire, l'analyse ou la rédaction. Que veux-tu travailler ?",
    suggestions: [
      "Comment structurer un commentaire composé ?",
      "Analyse la métaphore dans ce vers : « Mon enfant, ma sœur, songe à la douceur »",
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
  { id: "c1", title: "Équations du second degré", subject: "Mathématiques", level: "Lycée", chapter: "Algèbre", duration: "45 min", assistant: "maths" },
  { id: "c2", title: "Dérivées et variations", subject: "Mathématiques", level: "Lycée", chapter: "Analyse", duration: "60 min", assistant: "maths" },
  { id: "c3", title: "Probabilités conditionnelles", subject: "Mathématiques", level: "Supérieur", chapter: "Probabilités", duration: "50 min", assistant: "maths" },
  { id: "c4", title: "Lois de Newton", subject: "Physique-Chimie", level: "Lycée", chapter: "Mécanique", duration: "55 min", assistant: "physique" },
  { id: "c5", title: "Réactions acide-base", subject: "Physique-Chimie", level: "Lycée", chapter: "Chimie", duration: "40 min", assistant: "physique" },
  { id: "c6", title: "Le commentaire composé", subject: "Français", level: "Lycée", chapter: "Méthodologie", duration: "35 min", assistant: "francais" },
  { id: "c7", title: "Les figures de style", subject: "Français", level: "Collège", chapter: "Stylistique", duration: "30 min", assistant: "francais" },
  { id: "c8", title: "La Première Guerre mondiale", subject: "Histoire-Géo", level: "Lycée", chapter: "XXe siècle", duration: "50 min", assistant: "histoire" },
  { id: "c9", title: "La métropolisation", subject: "Histoire-Géo", level: "Lycée", chapter: "Géographie", duration: "40 min", assistant: "histoire" },
  { id: "c10", title: "La mitose et la méiose", subject: "SVT", level: "Lycée", chapter: "Génétique", duration: "45 min", assistant: "svt" },
  { id: "c11", title: "Tectonique des plaques", subject: "SVT", level: "Lycée", chapter: "Géologie", duration: "50 min", assistant: "svt" },
  { id: "c12", title: "Present perfect vs past simple", subject: "Anglais", level: "Collège", chapter: "Grammaire", duration: "25 min", assistant: "anglais" },
  { id: "c13", title: "La liberté chez Kant", subject: "Philosophie", level: "Lycée", chapter: "Notions", duration: "55 min", assistant: "philo" },
  { id: "c14", title: "Introduction à Python", subject: "Informatique", level: "Lycée", chapter: "Programmation", duration: "60 min", assistant: "info" },
  { id: "c15", title: "Algorithmes de tri", subject: "Informatique", level: "Supérieur", chapter: "Algorithmique", duration: "70 min", assistant: "info" },
];

const EXERCISES = [
  { id: "e1", title: "Résoudre 5 équations du 2nd degré", subject: "Mathématiques", difficulty: "Facile", assistant: "maths", description: "Série de cinq équations à résoudre avec le discriminant.", duration: "20 min" },
  { id: "e2", title: "Étude d'une fonction polynôme", subject: "Mathématiques", difficulty: "Moyen", assistant: "maths", description: "Domaine, dérivée, variations, tracé.", duration: "40 min" },
  { id: "e3", title: "Calcul d'intégrales par parties", subject: "Mathématiques", difficulty: "Difficile", assistant: "maths", description: "Quatre intégrales à calculer avec la méthode IPP.", duration: "45 min" },
  { id: "e4", title: "Chute libre d'une bille", subject: "Physique-Chimie", difficulty: "Moyen", assistant: "physique", description: "Mouvement uniformément accéléré, calculer vitesse et temps de chute.", duration: "25 min" },
  { id: "e5", title: "Dosage d'un acide faible", subject: "Physique-Chimie", difficulty: "Difficile", assistant: "physique", description: "Courbe de pH, équivalence, pKa.", duration: "40 min" },
  { id: "e6", title: "Commentaire d'un poème de Baudelaire", subject: "Français", difficulty: "Difficile", assistant: "francais", description: "Analyse d'un sonnet des Fleurs du Mal.", duration: "60 min" },
  { id: "e7", title: "Identifier 10 figures de style", subject: "Français", difficulty: "Facile", assistant: "francais", description: "Reconnaître métaphore, métonymie, allégorie, etc.", duration: "15 min" },
  { id: "e8", title: "Carte mentale : causes de 1914", subject: "Histoire-Géo", difficulty: "Moyen", assistant: "histoire", description: "Construire la carte mentale des causes lointaines et immédiates.", duration: "30 min" },
  { id: "e9", title: "Croquis : un littoral touristique", subject: "Histoire-Géo", difficulty: "Moyen", assistant: "histoire", description: "Réaliser un croquis avec légende organisée.", duration: "35 min" },
  { id: "e10", title: "Arbre généalogique et hérédité", subject: "SVT", difficulty: "Moyen", assistant: "svt", description: "Déterminer le mode de transmission d'une maladie génétique.", duration: "30 min" },
  { id: "e11", title: "Translate 10 sentences (FR → EN)", subject: "Anglais", difficulty: "Facile", assistant: "anglais", description: "Phrases courtes mêlant present perfect et past simple.", duration: "20 min" },
  { id: "e12", title: "Dissertation : « Suis-je ce que j'ai conscience d'être ? »", subject: "Philosophie", difficulty: "Difficile", assistant: "philo", description: "Sujet classique sur la conscience.", duration: "90 min" },
  { id: "e13", title: "Fonctions récursives en Python", subject: "Informatique", difficulty: "Moyen", assistant: "info", description: "Implémenter factorielle, Fibonacci, somme d'une liste.", duration: "35 min" },
  { id: "e14", title: "Requêtes SQL — jointures", subject: "Informatique", difficulty: "Difficile", assistant: "info", description: "INNER JOIN, LEFT JOIN, agrégations.", duration: "40 min" },
];

// Réponses simulées par assistant (prototype, pas d'appel réseau).
const FAKE_RESPONSES = {
  maths: [
    "Bonne question. Posons les choses : on commence par identifier les coefficients a, b, c. Tu veux que je détaille la suite ?",
    "Voilà l'idée : on calcule Δ = b² − 4ac. Pour x² − 5x + 6 : Δ = 25 − 24 = 1 > 0, donc deux racines : x = (5 ± 1)/2, soit x = 2 et x = 3.",
    "Pour t'entraîner, essaie : 2x² − 7x + 3 = 0. Je corrige dès que tu me donnes ta réponse.",
  ],
  physique: [
    "La deuxième loi de Newton s'écrit ΣF = m·a. Tu veux un exemple chiffré ?",
    "Pense aux unités : force en newtons (N), masse en kg, accélération en m/s². On vérifie toujours l'homogénéité.",
    "Pour l'équilibrage : on conserve chaque élément chimique. Donne-moi l'équation à équilibrer.",
  ],
  francais: [
    "Pour le commentaire composé : on cherche d'abord les axes d'étude. Quel est ton extrait ?",
    "« Mon enfant, ma sœur » est une apostrophe doublée d'une isotopie de la tendresse. La douceur appelle un voyage intérieur.",
    "Métonymie : on remplace par contiguïté (la couronne pour le roi). Synecdoque : par inclusion (une voile pour un navire).",
  ],
  histoire: [
    "Trois grandes causes : rivalités impériales, jeu des alliances, montée des nationalismes. Veux-tu un plan détaillé ?",
    "Plan possible : I. Une guerre idéologique, II. Une guerre par procuration, III. Vers la détente puis la rupture.",
    "Métropolisation : concentration des fonctions de commandement dans les grandes villes. Urbanisation : croissance de la population urbaine.",
  ],
  svt: [
    "La méiose produit quatre cellules haploïdes à partir d'une cellule diploïde, en deux divisions successives.",
    "Les chaînes de montagnes naissent souvent en zone de convergence : collision continentale ou subduction.",
    "Un écosystème = biocénose (vivants) + biotope (milieu) en interaction.",
  ],
  anglais: [
    "Present perfect: action linked to now (« I have just eaten »). Past simple: finished action (« I ate at 8 »).",
    "Send me your text — I'll mark mistakes and explain each correction.",
    "Useful vocab: climate change, global warming, carbon footprint, renewable energy, biodiversity loss.",
  ],
  philo: [
    "Pour problématiser : on cherche la tension. La liberté semble évidente, mais elle est aussi conditionnée. Illusion ou condition ?",
    "Chez Kant, la liberté est l'autonomie de la volonté : agir par devoir, par respect de la loi morale.",
    "Plan d'explication : situer le texte → expliquer linéairement → enjeu philosophique.",
  ],
  info: [
    "La récursivité = une fonction qui s'appelle elle-même, avec un cas de base pour arrêter. Exemple : factorielle.",
    "Une liste est mutable, un tuple non. On utilise les tuples pour des données fixes.",
    "Essaie d'écrire une fonction `tri_insertion(lst)`. Je corrige et propose des optimisations.",
  ],
};

export const TCS_NQT_GUIDE = {
  slug: 'tcs-nqt',
  title: 'TCS NQT',
  subtitle: 'Pattern, previous papers, topic map, and quick prep direction for freshers.',
  overviewCards: [
    {
      id: 'previous-year-apti-papers',
      title: 'Previous Year Apti Papers',
      description:
        'Open the internal resource library for memory-based numerical, reasoning, and verbal papers collected in the shared TCS repo.',
      type: 'anchor',
      href: '#resource-library-section',
      cta: 'Browse previous papers',
      accent: 'cyan',
    },
    {
      id: 'previous-year-coding-questions',
      title: 'Previous Year Coding Questions',
      description:
        'Open the in-app coding tab to use the coding sheet linked from the shared repo README along with the repo notes.',
      type: 'anchor',
      href: '#resource-library-section',
      cta: 'Browse coding resources',
      accent: 'indigo',
    },
    {
      id: 'aptitude',
      title: 'Aptitude',
      description:
        'Tips and tricks: memorize percentage-fraction conversions, ratio shortcuts, allegation, approximation, and standard formulas so most questions can be attacked in under 1 minute.',
      type: 'anchor',
      href: '#aptitude-section',
      cta: 'View aptitude topics',
      accent: 'emerald',
    },
    {
      id: 'reasoning',
      title: 'Reasoning',
      description:
        'TCS repeatedly rewards pattern spotting, arrangement logic, data sufficiency, and fast elimination instead of long derivations.',
      type: 'anchor',
      href: '#reasoning-section',
      cta: 'View reasoning topics',
      accent: 'amber',
    },
    {
      id: 'verbal-ability',
      title: 'Verbal Ability',
      description:
        'This is usually the fastest scoring section when grammar rules, sentence flow, and reading-comprehension scanning are practiced well.',
      type: 'anchor',
      href: '#verbal-section',
      cta: 'View verbal topics',
      accent: 'rose',
    },
  ],
  resourceTabs: [
    {
      id: 'previous-year-papers',
      label: 'Previous Year Papers',
      description: 'Markdown previous papers, solved slots, and PYQ collections from the dedicated TCS NQT PYQ repo.',
      resources: [
        {
          id: 'pyq-repo-readme',
          title: 'PYQ Repo Overview',
          description: 'Quick overview of the repository structure, materials, and where the previous papers are organized.',
          kind: 'markdown',
          format: 'Markdown',
          sourceLabel: 'Arjunpolen repo',
          downloadUrl: 'https://raw.githubusercontent.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/main/README.md',
          viewUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/blob/main/README.md',
        },
        {
          id: 'solved-paper-2024-morning',
          title: 'Solved Paper 2024 Morning Slot',
          description: 'A solved morning-slot paper with section-wise questions and answers in markdown form.',
          kind: 'markdown',
          format: 'Markdown',
          sourceLabel: 'Arjunpolen repo',
          downloadUrl: 'https://raw.githubusercontent.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/main/materials/solved-paper-2024-morning.md',
          viewUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/blob/main/materials/solved-paper-2024-morning.md',
        },
        {
          id: 'pyq-300',
          title: '300 PYQs Collection',
          description: 'Large practice bank covering aptitude, reasoning, verbal, and coding-style TCS NQT questions.',
          kind: 'markdown',
          format: 'Markdown',
          sourceLabel: 'Arjunpolen repo',
          downloadUrl: 'https://raw.githubusercontent.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/main/materials/pyq-300.md',
          viewUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/blob/main/materials/pyq-300.md',
        },
        {
          id: 'paper-bundle-1-5',
          title: 'Previous Papers 01 to 05',
          description: 'Five markdown previous-paper sets bundled inside the repo under the previous-papers folder.',
          kind: 'external',
          format: 'Bundle',
          sourceLabel: 'Arjunpolen repo',
          downloadUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/tree/main/materials/previous-papers',
          viewUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/tree/main/materials/previous-papers',
        },
        {
          id: 'paper-bundle-6-10',
          title: 'Previous Papers 06 to 10',
          description: 'Another five previous-paper markdown files from the same repo for continued practice.',
          kind: 'external',
          format: 'Bundle',
          sourceLabel: 'Arjunpolen repo',
          downloadUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/tree/main/materials/previous-papers',
          viewUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/tree/main/materials/previous-papers',
        },
      ],
    },
    {
      id: 'coding-questions',
      label: 'Coding Questions',
      description: 'Coding categories and previously asked style prompts from the dedicated TCS NQT coding sheet repo.',
      resources: [
        {
          id: 'coding-repo-overview',
          title: 'Coding Sheet Overview',
          description: 'Preview the repo README with all coding categories, problem links, and the previously asked coding section.',
          kind: 'markdown',
          format: 'Markdown',
          sourceLabel: 'karthikreddy-7 repo',
          downloadUrl: 'https://raw.githubusercontent.com/karthikreddy-7/TCS-NQT-CODING-SHEET/master/README.md',
          viewUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/blob/master/README.md',
        },
        {
          id: 'coding-previously-asked',
          title: 'Previously Asked Coding Questions',
          description: 'Jump directly to the previously asked coding section inside the coding sheet README.',
          kind: 'external',
          format: 'Link',
          sourceLabel: 'karthikreddy-7 repo',
          downloadUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/blob/master/README.md#previously-asked-coding-question',
          viewUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/blob/master/README.md#previously-asked-coding-question',
        },
        {
          id: 'coding-arrays',
          title: 'Problems on Arrays',
          description: 'Array-based TCS coding questions like reverse array, frequency, rotating arrays, and equilibrium index.',
          kind: 'external',
          format: 'Folder',
          sourceLabel: 'karthikreddy-7 repo',
          downloadUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/tree/master/Problems_on_Arrays',
          viewUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/tree/master/Problems_on_Arrays',
        },
        {
          id: 'coding-number',
          title: 'Problems on Numbers',
          description: 'Number problems like prime checks, Fibonacci, factorial, GCD, LCM, and series-based coding tasks.',
          kind: 'external',
          format: 'Folder',
          sourceLabel: 'karthikreddy-7 repo',
          downloadUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/tree/master/Problems_On_Number',
          viewUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/tree/master/Problems_On_Number',
        },
        {
          id: 'coding-number-system',
          title: 'Problems on Number System',
          description: 'Binary, decimal, octal, and number-to-words conversion practice from the coding sheet repo.',
          kind: 'external',
          format: 'Folder',
          sourceLabel: 'karthikreddy-7 repo',
          downloadUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/tree/master/Problems_On_Number_System',
          viewUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/tree/master/Problems_On_Number_System',
        },
        {
          id: 'coding-sorting',
          title: 'Problems on Sorting',
          description: 'Sorting-based coding resources covering bubble, selection, insertion, quick, and merge sort.',
          kind: 'external',
          format: 'Folder',
          sourceLabel: 'karthikreddy-7 repo',
          downloadUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/tree/master/Problems_On_Sorting',
          viewUrl: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET/tree/master/Problems_On_Sorting',
        },
      ],
    },
    {
      id: 'practice-materials',
      label: 'Practice Materials',
      description: 'Extra markdown materials from the PYQ repo for deeper practice around patterns, coding, and interview support.',
      resources: [
        {
          id: 'question-bank',
          title: 'Curated Questions Bank',
          description: 'Large markdown question bank with verified PYQ-style prompts and hints.',
          kind: 'markdown',
          format: 'Markdown',
          sourceLabel: 'Arjunpolen repo',
          downloadUrl: 'https://raw.githubusercontent.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/main/questions.md',
          viewUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/blob/main/questions.md',
        },
        {
          id: 'coding-questions-50',
          title: '50 Coding Questions',
          description: 'A compact markdown list of coding questions for quick daily TCS NQT coding revision.',
          kind: 'markdown',
          format: 'Markdown',
          sourceLabel: 'Arjunpolen repo',
          downloadUrl: 'https://raw.githubusercontent.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/main/materials/coding-questions-50.md',
          viewUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/blob/main/materials/coding-questions-50.md',
        },
        {
          id: 'dsa-patterns',
          title: 'DSA Patterns Notes',
          description: 'Pattern-oriented markdown notes that help connect repeated coding question types to reusable approaches.',
          kind: 'markdown',
          format: 'Markdown',
          sourceLabel: 'Arjunpolen repo',
          downloadUrl: 'https://raw.githubusercontent.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/main/materials/dsa-patterns.md',
          viewUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/blob/main/materials/dsa-patterns.md',
        },
        {
          id: 'hr-questions',
          title: 'HR Questions',
          description: 'Supporting HR question bank from the PYQ repo for later interview rounds after the test.',
          kind: 'markdown',
          format: 'Markdown',
          sourceLabel: 'Arjunpolen repo',
          downloadUrl: 'https://raw.githubusercontent.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/main/materials/hr-questions.md',
          viewUrl: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS/blob/main/materials/hr-questions.md',
        },
      ],
    },
  ],
  sections: [
    {
      id: 'aptitude-section',
      title: 'Aptitude Topics',
      eyebrow: 'Numerical Ability',
      description:
        'High-repeat topics seen across TCS NQT numerical ability coverage and recent preparation material.',
      accent: 'emerald',
      topics: [
        {
          title: 'Percentages',
          summary: 'Conversions, percentage change, successive percentages, and option elimination with fraction shortcuts.',
        },
        {
          title: 'Ratio and Proportion',
          summary: 'Ratios, proportions, partnership style comparisons, and fast relation setup between quantities.',
        },
        {
          title: 'Allegations and Mixtures',
          summary: 'Mixture concentration and weighted value questions solved quickly with allegation logic.',
        },
        {
          title: 'Averages',
          summary: 'Direct average, weighted average, replacement logic, and average shift patterns.',
        },
        {
          title: 'Profit and Loss',
          summary: 'Marked price, discount, profit percentage, and chained gain-loss calculations.',
        },
        {
          title: 'Work and Time',
          summary: 'Individual efficiency, combined work, LCM method, and pipes/cistern-style variants.',
        },
        {
          title: 'Speed, Time and Distance',
          summary: 'Relative speed, trains, average speed, and journey-split problems.',
        },
        {
          title: 'Number System, LCM and HCF',
          summary: 'Divisibility, factors, remainders, cyclicity, and foundational number properties.',
        },
        {
          title: 'Probability',
          summary: 'Basic event probability, complementary cases, and selection-style outcomes.',
        },
        {
          title: 'Permutation and Combination',
          summary: 'Arrangements, selections, and counting patterns used in advanced aptitude variants.',
        },
        {
          title: 'Geometry, Area and Perimeter',
          summary: '2D shapes, area formulas, mensuration basics, and comparison-based geometry.',
        },
        {
          title: 'Clocks, Calendar and Ages',
          summary: 'Calendar offsets, clock angle logic, and age relation word problems.',
        },
      ],
    },
    {
      id: 'reasoning-section',
      title: 'Reasoning Topics',
      eyebrow: 'Logical Ability',
      description:
        'Pattern-heavy reasoning topics repeatedly highlighted in TCS NQT reasoning preparation guides.',
      accent: 'amber',
      topics: [
        {
          title: 'Number and Letter Series',
          summary: 'Missing terms, alternating sequences, alphabet jumps, and mixed patterns.',
        },
        {
          title: 'Coding and Decoding',
          summary: 'Word coding, symbol replacement, letter shifting, and rule-based decoding.',
        },
        {
          title: 'Blood Relations',
          summary: 'Family-tree interpretation, coded relations, and quick relation mapping.',
        },
        {
          title: 'Seating Arrangement',
          summary: 'Linear and circular arrangements, adjacency constraints, and ordering logic.',
        },
        {
          title: 'Direction Sense',
          summary: 'Movement tracking, orientation changes, and shortest-path reasoning.',
        },
        {
          title: 'Data Sufficiency',
          summary: 'Check whether the provided statements are enough without solving fully.',
        },
        {
          title: 'Statement and Conclusion',
          summary: 'Inference quality, logical consistency, and conclusion validity checks.',
        },
        {
          title: 'Analogy and Odd One Out',
          summary: 'Relation mapping between terms and pattern-break identification.',
        },
        {
          title: 'Symbols and Notations',
          summary: 'Operator substitution, custom notation interpretation, and quick rule application.',
        },
        {
          title: 'Data Arrangement and Puzzles',
          summary: 'Grid filling, constraint mapping, and multi-variable deduction.',
        },
      ],
    },
    {
      id: 'verbal-section',
      title: 'Verbal Ability Topics',
      eyebrow: 'English Ability',
      description:
        'Fast-scoring verbal topics that regularly appear in TCS NQT foundation preparation material.',
      accent: 'rose',
      topics: [
        {
          title: 'Reading Comprehension',
          summary: 'Main idea, tone, detail retrieval, and inference from short passages.',
        },
        {
          title: 'Fill in the Blanks',
          summary: 'Grammar-based blanks, contextual vocabulary, and article/preposition usage.',
        },
        {
          title: 'Spotting Errors',
          summary: 'Agreement, tense, modifiers, prepositions, and common sentence-level grammar errors.',
        },
        {
          title: 'Sentence Completion',
          summary: 'Context fit, tone consistency, and grammar correctness.',
        },
        {
          title: 'Sentence Improvement',
          summary: 'Find the best rewritten segment while preserving meaning and grammar.',
        },
        {
          title: 'Sentence Arrangement and Para Jumbles',
          summary: 'Order jumbled statements through pronoun flow, connectors, and chronology.',
        },
        {
          title: 'Synonyms and Antonyms',
          summary: 'Frequent vocabulary testing through meaning and opposite meaning pairs.',
        },
        {
          title: 'Idioms and Phrases',
          summary: 'Contextual meaning of commonly used idiomatic expressions.',
        },
        {
          title: 'Active and Passive Voice',
          summary: 'Voice transformation with tense consistency and subject-object awareness.',
        },
        {
          title: 'Joining Sentences and Substitution',
          summary: 'Combine ideas cleanly and replace phrases with concise alternatives.',
        },
      ],
    },
  ],
  sources: [
    {
      label: 'Testbook TCS NQT syllabus and exam pattern',
      href: 'https://testbook.com/hi/tcs-nqt/syllabus-exam-pattern',
    },
    {
      label: 'Arjunpolen TCS NQT PYQ questions repo',
      href: 'https://github.com/Arjunpolen/TCS-NQT-PYQ-QUESTIONS',
    },
    {
      label: 'karthikreddy-7 TCS NQT coding sheet repo',
      href: 'https://github.com/karthikreddy-7/TCS-NQT-CODING-SHEET',
    },
    {
      label: 'Naukri Campus guide to TCS aptitude questions',
      href: 'https://www.naukri.com/campus/career-guidance/tcs-aptitude-questions',
    },
  ],
};

export const EXAM_GUIDES = [
  {
    label: 'TCS NQT',
    path: '/exam-guide/tcs-nqt',
    description: 'Aptitude, reasoning, verbal ability, and coding prep map.',
  },
];

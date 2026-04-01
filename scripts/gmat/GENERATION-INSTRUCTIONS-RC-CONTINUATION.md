# Чат 4 — ПРОДОЛЖЕНИЕ: RC Passages 51-100

Вставь этот промпт в новый чат Claude:

---

```
Continue generating GMAT Focus Edition Reading Comprehension passages with questions. This is PART 3 (passages 51-100).

Generate 50 passages (IDs gen-rc-0051 through gen-rc-0100), each with 3-4 questions.

Requirements:
- Passage length: 200-350 words each
- Difficulty distribution: 12 easy, 20 medium, 13 hard, 5 "700+"
- Topic diversity: 10 business, 10 science, 10 social science, 10 humanities, 10 technology
- Each passage should have 3-4 questions covering: Main Idea, Detail, Inference, Tone/Function

Topics to cover (one passage per topic):
51. The Decline of Shopping Malls (business, medium)
52. Antibiotic Resistance (science, easy)
53. Postcolonial Theory and Literature (humanities, hard)
54. Economics of Carbon Pricing (social science, medium)
55. The Water Cycle (science, easy)
56. Cybersecurity and Cloud Computing (technology, medium)
57. The Hard Problem of Consciousness (humanities, 700+)
58. Emerging Markets and Global Trade (business, medium)
59. The Placebo Effect (science, 700+)
60. Digital Privacy Legislation (technology, medium)
61. The Psychology of Decision Fatigue (social science, medium)
62. Ocean Energy: Tides and Waves (science, easy)
63. The Gig Economy and Labor Rights (social science, hard)
64. Autonomous Vehicles: Safety and Ethics (technology, hard)
65. The History of Jazz (humanities, easy)
66. Sustainable Agriculture and Organic Farming (science, medium)
67. Wealth Inequality in Developing Nations (social science, hard)
68. The Metaverse: Hype vs Reality (technology, medium)
69. Ancient Roman Engineering (humanities, easy)
70. The Future of Nuclear Fusion (science, hard)
71. Corporate Social Responsibility (business, medium)
72. The Science of Sleep and Memory (science, medium)
73. Modern Art and Its Critics (humanities, medium)
74. Fintech Disruption in Banking (business, hard)
75. The Ethics of Genetic Testing (science, 700+)
76. Immigration and Economic Growth (social science, medium)
77. 3D Printing in Manufacturing (technology, easy)
78. The Philosophy of Free Will (humanities, hard)
79. Venture Capital and Startup Ecosystems (business, medium)
80. Climate Migration and Displacement (social science, hard)
81. The Rise of Podcasting (technology, easy)
82. Behavioral Finance and Market Bubbles (business, 700+)
83. Food Security and Global Population (science, medium)
84. The Evolution of Human Language (humanities, medium)
85. Cryptocurrency Regulation (business, medium)
86. Renewable Energy Storage Solutions (technology, medium)
87. The Psychology of Motivation (social science, easy)
88. Space Tourism: Commercial and Ethical Dimensions (business, medium)
89. The Microplastics Problem (science, hard)
90. Ancient Greek Democracy vs Modern Democracy (humanities, hard)
91. EdTech and the Future of Learning (technology, medium)
92. The Economics of Healthcare Systems (social science, medium)
93. Synthetic Biology and Bioethics (science, 700+)
94. The Role of Central Banks (business, medium)
95. Deforestation and Indigenous Rights (social science, hard)
96. Quantum Encryption (technology, hard)
97. The Philosophy of Personal Identity (humanities, medium)
98. Platform Economics and Network Effects (business, hard)
99. Soil Degradation and Food Production (science, easy)
100. The Future of Work: Automation and Human Skills (social science, medium)

Output format — ONLY valid JSON array, same structure as below. Each question needs 5 options (A-E), correctAnswer, and explanation.

[
  {
    "id": "gen-rc-0051",
    "type": "RC",
    "section": "verbal",
    "difficulty": "medium",
    "topic": "reading-comprehension",
    "passage": "The decline of traditional shopping malls in the United States...[200-350 words]",
    "passageTitle": "The Decline of Shopping Malls",
    "questions": [
      {
        "id": "gen-rc-0051-q1",
        "questionStem": "The primary purpose of the passage is to",
        "options": [
          {"id": "A", "text": "..."},
          {"id": "B", "text": "..."},
          {"id": "C", "text": "..."},
          {"id": "D", "text": "..."},
          {"id": "E", "text": "..."}
        ],
        "correctAnswer": "B",
        "explanation": "..."
      },
      ...2-3 more questions
    ],
    "source": "SamiWISE Generated"
  },
  ...
]

Generate all 50 passages with their questions. Output ONLY the JSON array. Start with [ and end with ].
```

---

### Сохрани ответ в файл: `data/questions/gen-rc-part2.json`

После этого скажи мне — я объединю оба файла (gen-rc.json первые 50 + gen-rc-part2.json оставшиеся 50) в один.

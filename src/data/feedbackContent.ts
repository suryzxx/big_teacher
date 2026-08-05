export const feedbackQuestions = [
  {
    id: 1,
    question: "Why does the passage call footwork the engine of a badminton player's game?",
    options: [
      ["A", "Because it controls speed, balance, consistency, and endurance."],
      ["B", "Because it makes racket strings more powerful."],
      ["C", "Because it replaces the need for strong strokes."],
      ["D", "Because it slows the shuttlecock down."],
    ],
    correct: "A",
    selected: "A",
  },
  {
    id: 2,
    question: "What should a player do when lunging forward to protect the knee?",
    options: [
      ["A", "Land on the toes first and keep the heel raised."],
      ["B", "Land heel first and roll onto the flat of the foot."],
      ["C", "Cross both legs before reaching the shuttlecock."],
      ["D", "Keep the opposite arm close to the body."],
    ],
    correct: "B",
    selected: "B",
  },
  {
    id: 3,
    question: "When is the split-step performed?",
    options: [
      ["A", "After the shuttlecock lands."],
      ["B", "Only after a smash."],
      ["C", "As the opponent strikes the shuttlecock."],
      ["D", "Before the player serves."],
    ],
    correct: "C",
    selected: "B",
  },
  {
    id: 4,
    question: "Which movement pattern is described as one foot chasing the other without crossing?",
    options: [
      ["A", "Crossover steps"],
      ["B", "Scissor kick"],
      ["C", "Base recovery"],
      ["D", "Chasse steps"],
    ],
    correct: "D",
    selected: "D",
  },
  {
    id: 5,
    question: "What is the purpose of returning to the base position?",
    options: [
      ["A", "To wait near the net for every shot."],
      ["B", "To avoid being caught out of position for the next return."],
      ["C", "To make every shot a backhand shot."],
      ["D", "To reduce the need for a split-step."],
    ],
    correct: "B",
    selected: "B",
  },
  {
    id: 6,
    question: "Which drill asks players to practice movement patterns without a shuttlecock?",
    options: [
      ["A", "Shadow badminton"],
      ["B", "Multi-shuttle feeding"],
      ["C", "Agility ladder drills"],
      ["D", "Plyometric box jumps"],
    ],
    correct: "A",
    selected: "C",
  },
  {
    id: 7,
    question: "Why are rear-court movements described as mechanically demanding?",
    options: [
      ["A", "They only use the non-racket arm."],
      ["B", "They require players to stop using recovery steps."],
      ["C", "They often require rotation, backward movement, and weight transfer."],
      ["D", "They happen only during slow rallies."],
    ],
    correct: "C",
    selected: "C",
  },
] as const;

export const feedbackMessages = [
  {
    id: "sent-1",
    time: "May 15, 16:10",
    text: "You identified the main idea clearly. Recheck question 4 and add one more text detail next time.",
  },
  {
    id: "sent-2",
    time: "May 16, 09:25",
    text: "Good progress on evidence matching. Keep highlighting the sentence that proves each answer.",
  },
];

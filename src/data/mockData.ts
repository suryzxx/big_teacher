import type { ClassRoom, Resource, Student } from "../types";
import audioCityCover from "../assets/covers/audio-city.svg";
import audioWeatherCover from "../assets/covers/audio-weather.svg";
import ebookSpaceCover from "../assets/covers/ebook-space.svg";
import fictionGardenCover from "../assets/covers/fiction-garden.svg";
import readingMarketCover from "../assets/covers/reading-market.svg";
import readingRiverCover from "../assets/covers/reading-river.svg";
import videoBridgeCover from "../assets/covers/video-bridge.svg";
import videoMuseumCover from "../assets/covers/video-museum.svg";
import { studentAvatarImages } from "../assets/mock/students";

export const resources: Resource[] = [
  {
    id: "bk-01",
    title: "The Secret Garden Path and the Hidden Pond",
    type: "Writing",
    genre: "Fiction",
    topic: "Nature",
    lexile: 640,
    wordCount: 8200,
    coverImage: fictionGardenCover,
    description: "A short chapter book about friendship, observation, and garden ecosystems.",
    tags: ["chapter book", "vocabulary", "inference"],
  },
  {
    id: "au-01",
    title: "City Sounds Interview with Neighborhood Voices",
    type: "Podcast",
    genre: "Opinion",
    topic: "Community",
    lexile: 520,
    duration: "8 min",
    coverImage: audioCityCover,
    description: "A listening task with street interviews and note-taking prompts.",
    tags: ["listening", "main idea", "accent"],
  },
  {
    id: "vd-01",
    title: "How Bridges Work Across Rivers and Roads",
    type: "Video",
    genre: "Informational Text",
    topic: "Engineering",
    lexile: 760,
    duration: "11 min",
    coverImage: videoBridgeCover,
    description: "Animated explanation of tension, compression, and bridge design choices.",
    tags: ["science", "visual notes", "cause effect"],
  },
  {
    id: "rd-01",
    title: "Mastering the Court: A Comprehensive Guide to Badminton Footwork",
    type: "Reading",
    genre: "Short Story",
    topic: "Daily Life",
    lexile: 560,
    wordCount: 1450,
    coverImage: readingMarketCover,
    description: `In badminton, there is a widely acknowledged maxim among coaches and players: "Badminton is 30% handwork and 70% footwork." While powerful smashes, precise drops, and delicate net shots capture the audience's attention, none of these technical strokes are possible without sound footwork. Footwork is the engine of a badminton player's game. It dictates speed, balance, consistency, and endurance. Without efficient movement across the court, even the most refined racket technique becomes rendered ineffective.

The Importance of Good Footwork
Badminton is officially recognized as the world's fastest racket sport, with shuttlecocks exceeding speeds of 400 km/h. Because the shuttlecock does not bounce, players must reach it while it is still in the air.

Proper footwork serves three fundamental purposes:

Efficiency and Energy Conservation: Smooth, mechanical footwork minimizes unnecessary steps, allowing players to conserve vital energy throughout long, demanding matches.

Optimal Shot Execution: Good footwork ensures that a player arrives at the shuttlecock behind or underneath it, establishing a stable base to generate power and maintain accuracy.

Injury Prevention: Proper movement techniques, such as striking with the heel first during a forward lunge, absorb impact forces and protect the knees, ankles, and lower back from excessive strain.

The Base Position: The Hub of Movement
Every sequence of footwork begins and ends at the Base Position (often referred to as the center or home position). Located roughly in the middle of the court, this spot offers equal distance to all four corners.

Key Elements of the Ready Stance:
Leg Width: Feet are placed slightly wider than shoulder-width apart to create a low center of gravity.

Weight Distribution: Body weight rests primarily on the balls of the feet, keeping the heels slightly elevated.

Knee Flexion: Knees remain bent, acting as loaded springs ready to burst in any direction.

Racket Position: The racket is held up in front of the body at chest height, ready to react to fast-paced shots.

The Fundamental Movement Mechanics
To navigate the court smoothly, players utilize a combination of specific footwork patterns rather than standard running steps.

1. The Split-Step (Pre-Lifting)
The split-step is the universal trigger for explosive movement in badminton. Performed precisely as the opponent strikes the shuttlecock, the player executes a small, low bounce, landing with both feet simultaneously. This unweights the body and loads the muscles, allowing the player to react instantly in whichever direction the shuttlecock travels.

2. The Lunge
Used primarily to cover the front court (net area), the lunge allows a player to extend their reach while maintaining balance.

Heel-to-Toe Landing: When lunging forward, the leading foot must land heel first, rolling onto the flat of the foot. This absorbs the forward kinetic energy and prevents the knee from extending past the toes.

Non-Racket Arm Balance: The opposite arm extends backward to act as a counterweight.

3. Chasse Steps (Side-Stepping)
Instead of crossing the legs, players frequently use chasse steps, a quick gliding movement where one foot chases the other without crossing. This is highly effective for lateral movements (defending smashes) and short adjustments to the rear court.

4. Crossover Steps
Used to cover larger distances quickly, especially when moving to the deep rear court. The player rotates their hips and crosses one leg over the other to cover maximum ground in minimal steps.

Movement Coverage Across the Six Corners
A badminton court is typically divided into six primary target zones: two in the front court, two in the mid-court, and two in the rear court. Efficient footwork provides distinct pathways to reach each of these areas.
A. Forecourt Movement (Net Shots and Lifts)
Moving to the front corners requires explosive forward momentum. From the base position, the player executes a split-step, rotates toward the target corner, takes a quick chasse step, and finishes with a deep lunge on their racket-side foot.

B. Mid-Court Movement (Defensive Blocks and Drives)
Mid-court footwork relies on quick side-stepping and lateral lunges. When defending a smash, the player widens their stance, lowers their center of gravity, and pushes off the opposite leg to reach sideways, retrieving the shuttlecock early.

C. Rearcourt Movement (Clear, Drop, and Smash)
Moving to the back corners is mechanically the most demanding task.

Forehand Rear Corner: The player turns their hips 90 degrees, uses a combination of crossover or chasse steps to move backward, prepares the stroke, and finishes with a scissor kick, swapping the rear foot to the front upon striking to transfer kinetic weight into the shot.

Backhand Rear Corner: Moving to the non-racket side deep court requires a rapid pivot, turning the back fully toward the net to take the shuttlecock late, followed by a swift recovery step back toward the center.

Recovery: The Forgotten Half of Footwork
Moving to the shuttlecock is only half the battle; returning to the base position is equally crucial. Recovery footwork begins immediately after making contact with the shuttlecock.

By pushing explosively off the leading leg (in a lunge) or utilizing the momentum of a scissor kick (in the rear court), the player pushes back toward the center. Good recovery ensures that a player is never caught out of position when the opponent returns the shot.

Methods for Training and Improving Footwork
Developing fluid, automatic footwork requires disciplined, repetitive practice until movements enter muscle memory.

Shadow Badminton: Practicing footwork patterns on court without a shuttlecock. Players visualize opponent shots and focus purely on foot positioning, split-steps, and recovery speed.

Multi-Shuttle Feeding: A coach or partner rapidly feeds shuttlecocks to various corners of the court, forcing the player to execute footwork under high pace and fatigue.

Agility Ladder Drills: Exercises on a rope ladder improve foot speed, coordination, and ankle stability.

Core and Lower-Body Strength Training: Exercises like squats, lunges, and plyometric box jumps build the explosive power required for sudden directional changes.

Conclusion
In conclusion, badminton footwork is the foundational framework upon which all tactical play is built. It combines agility, rhythm, strength, and spatial awareness into a seamless, fluid motion across the court. By mastering the split-step, perfecting directional movement patterns to all six corners, and prioritizing fast recovery, a player transforms their game, turning chaotic scrambling into an effortless, graceful dance.`,
    tags: ["reading", "badminton", "footwork"],
  },
  {
    id: "bk-02",
    title: "Orbit Diary from the First Week in Space",
    type: "Writing",
    genre: "Science Fiction",
    topic: "Space",
    lexile: 880,
    wordCount: 12400,
    coverImage: ebookSpaceCover,
    description: "A mission log format story with evidence-based comprehension questions.",
    tags: ["journal", "sequence", "prediction"],
  },
  {
    id: "rd-02",
    title: "Why Rivers Bend and Change Their Course",
    type: "Reading",
    genre: "News",
    topic: "Earth Science",
    lexile: 710,
    wordCount: 2100,
    coverImage: readingRiverCover,
    description: "A nonfiction passage on erosion, meanders, and interpreting diagrams.",
    tags: ["diagram", "academic words", "summary"],
  },
  {
    id: "vd-02",
    title: "Museum Mystery Behind the Missing Portrait",
    type: "Video",
    genre: "Fantasy",
    topic: "Art",
    lexile: 590,
    duration: "9 min",
    coverImage: videoMuseumCover,
    description: "A short mystery video with prediction pauses and character tracking.",
    tags: ["speaking", "story map", "prediction"],
  },
  {
    id: "au-02",
    title: "Weather Report Lab for Comparing Forecasts",
    type: "Podcast",
    genre: "Biography",
    topic: "Weather",
    lexile: 680,
    duration: "7 min",
    coverImage: audioWeatherCover,
    description: "Forecast clips for extracting numbers, locations, and recommendations.",
    tags: ["numbers", "listening", "compare"],
  },
  {
    id: "rd-03",
    title: "Finding Clues in a Community Garden Notice",
    type: "Reading",
    genre: "Informational Text",
    topic: "Community",
    lexile: 610,
    wordCount: 1680,
    coverImage: readingMarketCover,
    description: "A practical reading passage for identifying purpose, details, and audience.",
    tags: ["notices", "details", "purpose"],
  },
  {
    id: "rd-04",
    title: "The Long Walk Home After the Rainstorm",
    type: "Reading",
    genre: "Short Story",
    topic: "Daily Life",
    lexile: 540,
    wordCount: 1320,
    coverImage: fictionGardenCover,
    description: "A narrative passage focused on mood, setting, and character choice.",
    tags: ["mood", "setting", "character"],
  },
  {
    id: "rd-05",
    title: "How Seeds Travel Through Wind and Water",
    type: "Reading",
    genre: "Informational Text",
    topic: "Nature",
    lexile: 730,
    wordCount: 1960,
    coverImage: readingRiverCover,
    description: "A science reading on plant life cycles and evidence from diagrams.",
    tags: ["science", "diagram", "evidence"],
  },
  {
    id: "rd-06",
    title: "School News Report About the New Library",
    type: "Reading",
    genre: "News",
    topic: "School",
    lexile: 670,
    wordCount: 1540,
    coverImage: readingMarketCover,
    description: "A news-style passage for distinguishing facts, quotes, and opinions.",
    tags: ["news", "facts", "quotes"],
  },
  {
    id: "vd-03",
    title: "Designing a Safer Playground Step by Step",
    type: "Video",
    genre: "Informational Text",
    topic: "Engineering",
    lexile: 700,
    duration: "10 min",
    coverImage: videoBridgeCover,
    description: "A design-thinking video about testing materials and improving a plan.",
    tags: ["design", "materials", "cause effect"],
  },
  {
    id: "vd-04",
    title: "The Case of the Vanishing Science Fair Poster",
    type: "Video",
    genre: "Fantasy",
    topic: "School",
    lexile: 620,
    duration: "8 min",
    coverImage: videoMuseumCover,
    description: "A short mystery video for prediction, sequence, and evidence tracking.",
    tags: ["mystery", "sequence", "prediction"],
  },
  {
    id: "vd-05",
    title: "Why Weather Maps Use Colors and Symbols",
    type: "Video",
    genre: "Informational Text",
    topic: "Weather",
    lexile: 740,
    duration: "12 min",
    coverImage: audioWeatherCover,
    description: "A visual explanation of map legends, weather symbols, and forecast data.",
    tags: ["weather", "maps", "symbols"],
  },
  {
    id: "rd-07",
    title: "The Helpful Robot at the School Fair",
    type: "Reading",
    genre: "Science Fiction",
    topic: "School",
    lexile: 690,
    wordCount: 1750,
    coverImage: ebookSpaceCover,
    description: "A reading passage about a student-built robot and the choices its team makes during a school fair.",
    tags: ["technology", "problem solving", "sequence"],
  },
  {
    id: "au-03",
    title: "Park Ranger Talk About Animal Tracks",
    type: "Podcast",
    genre: "Informational Text",
    topic: "Nature",
    lexile: 630,
    duration: "9 min",
    coverImage: audioCityCover,
    description: "A listening activity focused on identifying evidence from a ranger's field notes.",
    tags: ["listening", "evidence", "animals"],
  },
  {
    id: "vd-06",
    title: "Building a Windmill Model in Class",
    type: "Video",
    genre: "Informational Text",
    topic: "Engineering",
    lexile: 780,
    duration: "13 min",
    coverImage: videoBridgeCover,
    description: "A classroom experiment video about testing blades, recording results, and revising a model.",
    tags: ["experiment", "design", "energy"],
  },
  {
    id: "bk-03",
    title: "My Weekend Letter to a Future Friend",
    type: "Writing",
    genre: "Opinion",
    topic: "Daily Life",
    lexile: 600,
    wordCount: 2400,
    coverImage: fictionGardenCover,
    description: "A writing prompt that asks students to describe a weekend choice and explain why it mattered.",
    tags: ["writing prompt", "opinion", "reflection"],
  },
  {
    id: "rd-08",
    title: "How a Local Market Reduces Food Waste",
    type: "Reading",
    genre: "News",
    topic: "Community",
    lexile: 760,
    wordCount: 2050,
    coverImage: readingMarketCover,
    description: "A news reading about planning, cooperation, and practical steps a market takes to reduce waste.",
    tags: ["news", "community", "main idea"],
  },
];

const tasks = [
  {
    id: "t-01",
    title: "Read: Why Rivers Bend",
    resourceType: "Reading" as const,
    dueDate: "Jul 25",
  },
  {
    id: "t-02",
    title: "Watch: How Bridges Work",
    resourceType: "Video" as const,
    dueDate: "Jul 27",
  },
  {
    id: "t-03",
    title: "Listen: Weather Report Lab",
    resourceType: "Podcast" as const,
    dueDate: "Jul 28",
  },
];

const classStudentSeeds = [
  ["Mia Chen", 710, 96, 92, "Low"],
  ["Leo Wang", 650, 74, 78, "Medium"],
  ["Amy Zhang", 590, 42, 54, "High"],
  ["Noah Li", 760, 112, 96, "Low"],
  ["Sophie Liu", 830, 88, 86, "Low"],
  ["Ethan Sun", 790, 64, 72, "Medium"],
  ["Grace Hu", 910, 118, 98, "Low"],
  ["Olivia Chen", 740, 82, 84, "Low"],
  ["Henry Zhao", 680, 70, 76, "Medium"],
  ["Emma Lin", 810, 104, 94, "Low"],
  ["Aaliyah Johnson", 930, 108, 90, "Low"],
  ["Ethan Kim", 880, 92, 82, "Low"],
  ["Mia Rodriguez", 810, 76, 74, "Medium"],
  ["Liam Chen", 760, 68, 70, "Low"],
  ["Sophia Patel", 710, 58, 62, "Medium"],
  ["Noah Thompson", 980, 122, 97, "Low"],
  ["Isabella Garcia", 840, 94, 88, "Low"],
  ["James Wilson", 690, 46, 48, "High"],
  ["Olivia Martinez", 900, 106, 91, "Low"],
  ["Benjamin Moore", 770, 66, 73, "Low"],
  ["Chloe Anderson", 860, 98, 89, "Low"],
  ["William Taylor", 650, 44, 50, "High"],
  ["Lucas Brown", 720, 72, 69, "Medium"],
  ["Ava Davis", 800, 86, 81, "Low"],
  ["Daniel Park", 875, 100, 87, "Low"],
] satisfies Array<[string, number, number, number, Student["risk"]]>;

function makeClassStudent([name, readingLevel, weeklyMinutes, completionRate, risk]: (typeof classStudentSeeds)[number], index: number): Student {
  const taskProgress = Math.min(100, Math.max(0, completionRate + ((index % 5) - 2) * 6));
  const secondProgress = Math.min(100, Math.max(0, completionRate - 18 + (index % 4) * 7));

  return {
    id: `s-${String(index + 1).padStart(2, "0")}`,
    name,
    avatarColor: "#ffffff",
    avatarImage: studentAvatarImages[index % studentAvatarImages.length],
    readingLevel,
    weeklyMinutes,
    completionRate,
    risk,
    tasks: [
      {
        ...tasks[0],
        score: risk === "High" ? null : Math.min(98, 72 + (index % 8) * 3),
        progress: taskProgress,
        status: taskProgress >= 100 ? "Completed" : risk === "High" ? "Needs help" : "In progress",
      },
      {
        ...tasks[1],
        score: secondProgress >= 100 ? Math.min(96, 78 + (index % 6) * 3) : null,
        progress: secondProgress,
        status: secondProgress >= 100 ? "Submitted" : "In progress",
      },
      {
        ...tasks[2],
        score: null,
        progress: Math.max(0, completionRate - 52),
        status: completionRate > 70 ? "In progress" : "Not started",
      },
    ],
  };
}

export const classes: ClassRoom[] = [
  {
    id: "c-01",
    name: "G4-Rainbow Class",
    grade: "G4",
    schedule: "Mon / Wed 16:30",
    activeUnit: "Earth Around Us",
    students: classStudentSeeds.map(makeClassStudent),
  },
  {
    id: "c-02",
    name: "G4-Sunshine Class",
    grade: "G4",
    schedule: "Tue / Thu 18:00",
    activeUnit: "Design Thinking",
    students: [
      {
        id: "s-05",
        name: "Sophie Liu",
        avatarColor: "#dc2626",
        readingLevel: 830,
        weeklyMinutes: 88,
        completionRate: 86,
        risk: "Low",
        tasks: [
          { ...tasks[1], score: 91, progress: 100, status: "Completed" },
          { ...tasks[0], score: null, progress: 68, status: "In progress" },
          { ...tasks[2], score: null, progress: 34, status: "In progress" },
        ],
      },
      {
        id: "s-06",
        name: "Ethan Sun",
        avatarColor: "#0891b2",
        readingLevel: 790,
        weeklyMinutes: 64,
        completionRate: 72,
        risk: "Medium",
        tasks: [
          { ...tasks[1], score: null, progress: 82, status: "Submitted" },
          { ...tasks[0], score: null, progress: 50, status: "In progress" },
          { ...tasks[2], score: null, progress: 10, status: "Needs help" },
        ],
      },
      {
        id: "s-07",
        name: "Grace Hu",
        avatarColor: "#16a34a",
        readingLevel: 910,
        weeklyMinutes: 118,
        completionRate: 98,
        risk: "Low",
        tasks: [
          { ...tasks[1], score: 95, progress: 100, status: "Completed" },
          { ...tasks[0], score: 90, progress: 100, status: "Completed" },
          { ...tasks[2], score: null, progress: 76, status: "In progress" },
        ],
      },
    ],
  },
  {
    id: "c-03",
    name: "G4-Moonlight Class",
    grade: "G4",
    schedule: "Wed / Fri 17:00",
    activeUnit: "Reading Adventures",
    students: [
      {
        id: "s-08",
        name: "Olivia Chen",
        avatarColor: "#a855f7",
        avatarImage: studentAvatarImages[10],
        readingLevel: 740,
        weeklyMinutes: 82,
        completionRate: 84,
        risk: "Low",
        tasks: [
          { ...tasks[0], score: 86, progress: 100, status: "Completed" },
          { ...tasks[1], score: null, progress: 62, status: "In progress" },
          { ...tasks[2], score: null, progress: 28, status: "In progress" },
        ],
      },
      {
        id: "s-09",
        name: "Henry Zhao",
        avatarColor: "#f97316",
        avatarImage: studentAvatarImages[15],
        readingLevel: 680,
        weeklyMinutes: 70,
        completionRate: 76,
        risk: "Medium",
        tasks: [
          { ...tasks[0], score: null, progress: 80, status: "Submitted" },
          { ...tasks[1], score: null, progress: 40, status: "In progress" },
          { ...tasks[2], score: null, progress: 12, status: "Needs help" },
        ],
      },
      {
        id: "s-10",
        name: "Emma Lin",
        avatarColor: "#059669",
        avatarImage: studentAvatarImages[18],
        readingLevel: 810,
        weeklyMinutes: 104,
        completionRate: 94,
        risk: "Low",
        tasks: [
          { ...tasks[0], score: 92, progress: 100, status: "Completed" },
          { ...tasks[1], score: 88, progress: 100, status: "Submitted" },
          { ...tasks[2], score: null, progress: 66, status: "In progress" },
        ],
      },
    ],
  },
];

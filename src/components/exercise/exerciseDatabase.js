// Exercise Database — Age 0-100, by Location, with Medical Condition Flags
// blockedFor: conditions that make this exercise unsafe

export const AGE_GROUPS = [
    { key: "0-1", label: "Infants (0–1 yr)", emoji: "👶", mins: "5–10 min", isBaby: true },
    { key: "1-2", label: "Toddlers (1–2 yr)", emoji: "👶", mins: "10 min", isBaby: true },
    { key: "2-3", label: "Toddlers (2–3 yr)", emoji: "🧒", mins: "15 min", isBaby: true },
    { key: "3-4", label: "Children (3–4 yr)", emoji: "🧒", mins: "20 min", isBaby: true },
    { key: "4-5", label: "Children (4–5 yr)", emoji: "🧒", mins: "20–30 min", isBaby: true },
    { key: "6-10", label: "Children (6–10 yr)", emoji: "🧒", mins: "60 min", isBaby: false },
    { key: "11-20", label: "Teenagers (11–20 yr)", emoji: "🧑", mins: "60 min", isBaby: false },
    { key: "21-30", label: "Young Adults (21–30 yr)", emoji: "👨", mins: "45–60 min", isBaby: false },
    { key: "31-40", label: "Adults (31–40 yr)", emoji: "👨‍💼", mins: "30–45 min", isBaby: false },
    { key: "41-50", label: "Adults (41–50 yr)", emoji: "👨‍🦱", mins: "30 min", isBaby: false },
    { key: "51-60", label: "Adults (51–60 yr)", emoji: "👴", mins: "20–30 min", isBaby: false },
    { key: "61-70", label: "Seniors (61–70 yr)", emoji: "👴", mins: "20–30 min", isBaby: false },
    { key: "71-80", label: "Seniors (71–80 yr)", emoji: "👵", mins: "15–20 min", isBaby: false },
    { key: "81-90", label: "Seniors (81–90 yr)", emoji: "👵", mins: "10–15 min", isBaby: false },
    { key: "91-100", label: "Seniors (91–100 yr)", emoji: "🧓", mins: "5–10 min", isBaby: false },
];

// Map age number → group key
export function getAgeGroupKey(age) {
    if (!age && age !== 0) return "21-30";
    if (age <= 1) return "0-1";
    if (age <= 2) return "1-2";
    if (age <= 3) return "2-3";
    if (age <= 4) return "3-4";
    if (age <= 5) return "4-5";
    if (age <= 10) return "6-10";
    if (age <= 20) return "11-20";
    if (age <= 30) return "21-30";
    if (age <= 40) return "31-40";
    if (age <= 50) return "41-50";
    if (age <= 60) return "51-60";
    if (age <= 70) return "61-70";
    if (age <= 80) return "71-80";
    if (age <= 90) return "81-90";
    return "91-100";
}

// Locations available per age group
export const LOCATION_AVAILABILITY = {
    "0-1": ["home", "park", "yoga"],
    "1-2": ["home", "park", "yoga"],
    "2-3": ["home", "park", "yoga"],
    "3-4": ["home", "park", "yoga"],
    "4-5": ["home", "park", "yoga", "pool"],
    "6-10": ["home", "park", "yoga", "pool"],
    "11-20": ["home", "park", "gym", "yoga", "pool"],
    "21-30": ["home", "park", "gym", "yoga", "pool"],
    "31-40": ["home", "park", "gym", "yoga", "pool"],
    "41-50": ["home", "park", "gym", "yoga", "pool"],
    "51-60": ["home", "park", "gym", "yoga", "pool"],
    "61-70": ["home", "park", "yoga", "pool"],
    "71-80": ["home", "park", "yoga", "pool"],
    "81-90": ["home", "park", "yoga", "pool"],
    "91-100": ["home", "park", "yoga", "pool"],
};

export const LOCATION_META = {
    home: { label: "Home", icon: "🏠", color: "from-amber-400 to-orange-500" },
    park: { label: "Park/Ground", icon: "🌳", color: "from-green-400 to-emerald-500" },
    gym: { label: "Gym", icon: "🏋️", color: "from-purple-400 to-violet-600" },
    yoga: { label: "Yoga Center", icon: "🧘", color: "from-rose-400 to-pink-500" },
    pool: { label: "Pool", icon: "🏊", color: "from-blue-400 to-cyan-500" },
};

export const MEDICAL_CONDITIONS = [
    { key: "diabetes", label: "Diabetes", emoji: "🩸" },
    { key: "heart_disease", label: "Heart Disease", emoji: "❤️" },
    { key: "knee_pain", label: "Knee Pain", emoji: "🦵" },
    { key: "hypertension", label: "High BP", emoji: "💊" },
    { key: "obesity", label: "Obesity", emoji: "⚖️" },
    { key: "arthritis", label: "Arthritis", emoji: "🦴" },
];

// Full exercise database
export const EXERCISE_DB = {

    // ─── BABIES 0-1 (handled by BabyCard) ────────────────────────────────────
    "0-1": {
        home: [
            { name: "Tummy Time", icon: "🤱", duration: "3–5 min", calories: 5, desc: "Helps develop neck and shoulder strength", blockedFor: [] },
            { name: "Gentle Leg Cycling", icon: "🦵", duration: "5 min", calories: 3, desc: "Passive movement to build leg awareness", blockedFor: [] },
            { name: "Baby Massage (Malish)", icon: "🫶", duration: "10 min", calories: 2, desc: "Full body oil massage for growth & bonding", blockedFor: [] },
            { name: "Arm Stretching", icon: "🙆", duration: "3 min", calories: 2, desc: "Gentle arm pull while baby is on back", blockedFor: [] },
            { name: "Rolling Practice", icon: "🔄", duration: "5 min", calories: 4, desc: "Guide baby to roll from back to tummy", blockedFor: [] },
        ],
        park: [
            { name: "Fresh Air Pram Walk", icon: "🛒", duration: "15 min", calories: 0, desc: "Stroller walk in open air — sensory development", blockedFor: [] },
            { name: "Sunlight Exposure", icon: "☀️", duration: "10 min", calories: 0, desc: "Morning sun for Vitamin D", blockedFor: [] },
            { name: "Supervised Grass Touch", icon: "🌿", duration: "5 min", calories: 2, desc: "Sensory play on soft grass", blockedFor: [] },
            { name: "Baby Bicycle in Pram", icon: "🚼", duration: "10 min", calories: 0, desc: "Smooth outdoor movement journey", blockedFor: [] },
            { name: "Gentle Rocking", icon: "🌊", duration: "5 min", calories: 1, desc: "Rocking motion in parent's arms outdoors", blockedFor: [] },
        ],
        yoga: [
            { name: "Balloon Breathing", icon: "🎈", duration: "5 min", calories: 1, desc: "Parent demonstrates slow deep breathing", blockedFor: [] },
            { name: "Butterfly Pose (guided)", icon: "🦋", duration: "3 min", calories: 2, desc: "Gentle hip flexion by parent", blockedFor: [] },
            { name: "Child's Pose", icon: "🧘", duration: "5 min", calories: 2, desc: "Parent-assisted gentle forward bend", blockedFor: [] },
            { name: "Cat-Cow (as baby watch)", icon: "🐱", duration: "5 min", calories: 1, desc: "Parent does poses for baby to watch & learn", blockedFor: [] },
            { name: "Calming Breath Circle", icon: "🌬️", duration: "5 min", calories: 1, desc: "Parent breathes rhythmically to calm baby", blockedFor: [] },
        ],
    },

    "1-2": {
        home: [
            { name: "Walking Practice", icon: "🚶", duration: "10 min", calories: 20, desc: "Hold hands and walk around the room", blockedFor: [] },
            { name: "Baby Massage (Malish)", icon: "🫶", duration: "10 min", calories: 2, desc: "Full body oil massage, great for growth", blockedFor: [] },
            { name: "Soft Ball Play", icon: "⚽", duration: "10 min", calories: 15, desc: "Rolling and catching soft ball", blockedFor: [] },
            { name: "Simple Dancing", icon: "💃", duration: "5 min", calories: 20, desc: "Bounce and sway to music with parent", blockedFor: [] },
            { name: "Climbing Cushions", icon: "🛋️", duration: "10 min", calories: 25, desc: "Crawl and climb over soft cushions safely", blockedFor: [] },
        ],
        park: [
            { name: "Walking on Grass", icon: "🌿", duration: "10 min", calories: 20, desc: "Toddler free-walk on soft grass", blockedFor: [] },
            { name: "Playground Slide", icon: "🛝", duration: "10 min", calories: 20, desc: "Supervised slide with parent", blockedFor: [] },
            { name: "Sand Play", icon: "🏖️", duration: "15 min", calories: 15, desc: "Sensory play with sand", blockedFor: [] },
            { name: "Ball Rolling Outdoors", icon: "⚽", duration: "10 min", calories: 20, desc: "Chase and kick soft ball on grass", blockedFor: [] },
            { name: "Nature Walk", icon: "🌲", duration: "10 min", calories: 15, desc: "Toddler explores park with parent", blockedFor: [] },
        ],
        yoga: [
            { name: "Butterfly Pose", icon: "🦋", duration: "5 min", calories: 5, desc: "Open legs and flap knees like butterfly", blockedFor: [] },
            { name: "Tree Pose", icon: "🌳", duration: "3 min", calories: 5, desc: "Balance on one foot with parent support", blockedFor: [] },
            { name: "Cat-Cow Stretch", icon: "🐱", duration: "5 min", calories: 8, desc: "On all fours, alternate arch and sag back", blockedFor: [] },
            { name: "Child's Pose", icon: "🧘", duration: "5 min", calories: 4, desc: "Sit back on heels, arms forward", blockedFor: [] },
            { name: "Balloon Breathing", icon: "🎈", duration: "5 min", calories: 2, desc: "Deep belly breathing — belly rises like balloon", blockedFor: [] },
        ],
    },

    "2-3": {
        home: [
            { name: "Running in Place", icon: "🏃", duration: "5 min", calories: 30, desc: "March and run in living room", blockedFor: [] },
            { name: "Jumping in Place", icon: "🦘", duration: "5 min", calories: 25, desc: "Two-foot jumps, builds confidence", blockedFor: [] },
            { name: "Throwing Soft Ball", icon: "🎾", duration: "10 min", calories: 20, desc: "Underarm throw and catch with parent", blockedFor: [] },
            { name: "Dancing Exercise", icon: "💃", duration: "10 min", calories: 35, desc: "Freestyle movement to children's music", blockedFor: [] },
            { name: "Basic Stretching", icon: "🤸", duration: "5 min", calories: 10, desc: "Touch toes, reach up, side bends", blockedFor: [] },
        ],
        park: [
            { name: "Running on Grass", icon: "🏃", duration: "10 min", calories: 40, desc: "Free run in open park area", blockedFor: [] },
            { name: "Jumping", icon: "🦘", duration: "5 min", calories: 25, desc: "Jump from small steps or ground level", blockedFor: [] },
            { name: "Playground Climbing", icon: "🧗", duration: "10 min", calories: 35, desc: "Supervised bar/ladder climbing", blockedFor: [] },
            { name: "Catch & Throw Games", icon: "⚾", duration: "10 min", calories: 25, desc: "Simple catch game with parent", blockedFor: [] },
            { name: "Nature Exploring Walk", icon: "🌲", duration: "10 min", calories: 20, desc: "Walking and observing nature", blockedFor: [] },
        ],
        yoga: [
            { name: "Animal Walks", icon: "🐻", duration: "10 min", calories: 30, desc: "Bear walk, frog jump, crab walk", blockedFor: [] },
            { name: "Tree Pose", icon: "🌳", duration: "3 min", calories: 5, desc: "Balance on one leg, arms as branches", blockedFor: [] },
            { name: "Cat-Cow Stretch", icon: "🐱", duration: "5 min", calories: 8, desc: "Spinal mobility on all fours", blockedFor: [] },
            { name: "Butterfly Pose", icon: "🦋", duration: "5 min", calories: 5, desc: "Seated hip stretch, flap legs", blockedFor: [] },
            { name: "Balloon Breathing", icon: "🎈", duration: "5 min", calories: 2, desc: "Diaphragmatic breathing exercise", blockedFor: [] },
        ],
    },

    "3-4": {
        home: [
            { name: "Running", icon: "🏃", duration: "10 min", calories: 50, desc: "Indoor running between rooms (supervised)", blockedFor: [] },
            { name: "Jumping Jacks", icon: "⭐", duration: "5 min", calories: 35, desc: "Basic coordination jumping exercise", blockedFor: [] },
            { name: "Cycling (balance bike)", icon: "🚲", duration: "10 min", calories: 30, desc: "Balance bike practice indoors or patio", blockedFor: [] },
            { name: "Throwing & Catching", icon: "⚽", duration: "10 min", calories: 25, desc: "Ball games with parent", blockedFor: [] },
            { name: "Simple Yoga Stretches", icon: "🧘", duration: "10 min", calories: 15, desc: "Child-friendly yoga poses", blockedFor: [] },
        ],
        park: [
            { name: "Running", icon: "🏃", duration: "15 min", calories: 60, desc: "Free run in open park", blockedFor: [] },
            { name: "Jumping", icon: "🦘", duration: "5 min", calories: 30, desc: "Jump and hop on flat ground", blockedFor: [] },
            { name: "Cycling", icon: "🚲", duration: "10 min", calories: 40, desc: "Small cycle on flat path", blockedFor: [] },
            { name: "Catching Ball", icon: "⚾", duration: "10 min", calories: 25, desc: "Simple throw-and-catch game", blockedFor: [] },
            { name: "Playground Equipment", icon: "🛝", duration: "15 min", calories: 45, desc: "Slides, swings, climbing", blockedFor: [] },
        ],
        yoga: [
            { name: "Animal Walks", icon: "🐻", duration: "10 min", calories: 30, desc: "Bear walk, frog jumps, crab walk", blockedFor: [] },
            { name: "Tree Pose", icon: "🌳", duration: "5 min", calories: 8, desc: "Balance on one leg", blockedFor: [] },
            { name: "Warrior Pose", icon: "⚔️", duration: "5 min", calories: 10, desc: "Strong standing pose, builds confidence", blockedFor: [] },
            { name: "Child's Pose", icon: "🧘", duration: "5 min", calories: 5, desc: "Calming rest pose", blockedFor: [] },
            { name: "Balloon Breathing", icon: "🎈", duration: "5 min", calories: 2, desc: "Belly breathing for calm", blockedFor: [] },
        ],
    },

    "4-5": {
        home: [
            { name: "Running", icon: "🏃", duration: "10 min", calories: 55, desc: "Indoor running games", blockedFor: [] },
            { name: "Jumping Jacks", icon: "⭐", duration: "5 min", calories: 35, desc: "Full coordination jumping", blockedFor: [] },
            { name: "Skipping Rope", icon: "🪢", duration: "5 min", calories: 40, desc: "Basic skip rope jumping", blockedFor: [] },
            { name: "Dancing", icon: "💃", duration: "10 min", calories: 45, desc: "Free dance to children's music", blockedFor: [] },
            { name: "Simple Yoga Poses", icon: "🧘", duration: "10 min", calories: 15, desc: "Tree, warrior, butterfly poses", blockedFor: [] },
        ],
        park: [
            { name: "Running", icon: "🏃", duration: "15 min", calories: 65, desc: "Free run in park", blockedFor: [] },
            { name: "Cycling", icon: "🚲", duration: "15 min", calories: 50, desc: "Small cycle on path", blockedFor: [] },
            { name: "Skipping Rope", icon: "🪢", duration: "10 min", calories: 50, desc: "Skip rope in open area", blockedFor: [] },
            { name: "Playing Football", icon: "⚽", duration: "15 min", calories: 60, desc: "Kick and run with ball", blockedFor: [] },
            { name: "Playground Climbing", icon: "🧗", duration: "10 min", calories: 40, desc: "Bars, slides, swings", blockedFor: [] },
        ],
        yoga: [
            { name: "Surya Namaskar (basic)", icon: "🌅", duration: "10 min", calories: 30, desc: "Simple 5-step sun salutation", blockedFor: [] },
            { name: "Tree Pose", icon: "🌳", duration: "5 min", calories: 8, desc: "Balance pose", blockedFor: [] },
            { name: "Warrior Pose", icon: "⚔️", duration: "5 min", calories: 10, desc: "Standing strength pose", blockedFor: [] },
            { name: "Butterfly Pose", icon: "🦋", duration: "5 min", calories: 5, desc: "Hip opener", blockedFor: [] },
            { name: "Balloon Breathing", icon: "🎈", duration: "5 min", calories: 2, desc: "Lung strength breathing", blockedFor: [] },
        ],
        pool: [
            { name: "Basic Swimming", icon: "🏊", duration: "15 min", calories: 60, desc: "Parent-assisted pool play", blockedFor: [] },
            { name: "Water Kicking", icon: "🦵", duration: "10 min", calories: 30, desc: "Hold pool edge and kick legs", blockedFor: [] },
            { name: "Floating Practice", icon: "🛟", duration: "10 min", calories: 15, desc: "Float with parent support", blockedFor: [] },
            { name: "Water Walking", icon: "🚶", duration: "10 min", calories: 25, desc: "Walk in shallow water", blockedFor: [] },
            { name: "Pool Games", icon: "🎉", duration: "15 min", calories: 40, desc: "Fun water splashing games", blockedFor: [] },
        ],
    },

    // ─── CHILDREN 6-10 ───────────────────────────────────────────────────────
    "6-10": {
        home: [
            { name: "Jumping Jacks", icon: "⭐", duration: "10 min", calories: 60, desc: "Full body cardio warm-up", blockedFor: [] },
            { name: "Skipping Rope", icon: "🪢", duration: "10 min", calories: 70, desc: "Coordination and stamina builder", blockedFor: [] },
            { name: "Basic Stretching", icon: "🤸", duration: "10 min", calories: 20, desc: "Hamstring, shoulder, back stretches", blockedFor: [] },
            { name: "Dancing Exercise", icon: "💃", duration: "15 min", calories: 80, desc: "Freestyle fun dance workout", blockedFor: [] },
            { name: "Animal Walks", icon: "🐻", duration: "10 min", calories: 50, desc: "Bear crawl, crab walk, frog jumps", blockedFor: [] },
        ],
        park: [
            { name: "Running", icon: "🏃", duration: "20 min", calories: 100, desc: "Free run in open area", blockedFor: [] },
            { name: "Playing Football", icon: "⚽", duration: "30 min", calories: 150, desc: "Team sport for coordination", blockedFor: [] },
            { name: "Cycling", icon: "🚲", duration: "20 min", calories: 90, desc: "Cycling on flat park path", blockedFor: [] },
            { name: "Climbing Playground", icon: "🧗", duration: "15 min", calories: 70, desc: "Monkey bars, climbing frame", blockedFor: [] },
            { name: "Catch & Throw Games", icon: "⚾", duration: "20 min", calories: 60, desc: "Cricket/baseball style throwing", blockedFor: [] },
        ],
        yoga: [
            { name: "Butterfly Pose", icon: "🦋", duration: "5 min", calories: 8, desc: "Seated hip opener", blockedFor: [] },
            { name: "Tree Pose", icon: "🌳", duration: "5 min", calories: 8, desc: "Balance and focus", blockedFor: [] },
            { name: "Cat-Cow Pose", icon: "🐱", duration: "5 min", calories: 10, desc: "Spinal flexibility", blockedFor: [] },
            { name: "Child's Pose", icon: "🧘", duration: "5 min", calories: 5, desc: "Rest and stretch", blockedFor: [] },
            { name: "Balloon Breathing", icon: "🎈", duration: "5 min", calories: 2, desc: "Lung capacity practice", blockedFor: [] },
        ],
        pool: [
            { name: "Basic Swimming", icon: "🏊", duration: "20 min", calories: 100, desc: "Freestyle swimming practice", blockedFor: [] },
            { name: "Water Kicking", icon: "🦵", duration: "10 min", calories: 40, desc: "Kickboard leg training", blockedFor: [] },
            { name: "Floating Practice", icon: "🛟", duration: "10 min", calories: 20, desc: "Back float balance", blockedFor: [] },
            { name: "Water Walking", icon: "🚶", duration: "10 min", calories: 30, desc: "Resistance walk in pool", blockedFor: [] },
            { name: "Pool Tag Games", icon: "🎉", duration: "15 min", calories: 60, desc: "Fun water chase games", blockedFor: [] },
        ],
    },

    // ─── TEENAGERS 11-20 ─────────────────────────────────────────────────────
    "11-20": {
        home: [
            { name: "Push-ups", icon: "💪", duration: "15 min", calories: 80, desc: "3 sets × 15 reps, chest & arms", blockedFor: [] },
            { name: "Squats", icon: "🦵", duration: "15 min", calories: 90, desc: "3 sets × 20 reps, legs & glutes", blockedFor: ["knee_pain"] },
            { name: "Plank", icon: "🧱", duration: "10 min", calories: 50, desc: "3 sets × 1 min hold, core strength", blockedFor: [] },
            { name: "Jump Rope", icon: "🪢", duration: "10 min", calories: 110, desc: "High intensity cardio", blockedFor: ["knee_pain", "heart_disease"] },
            { name: "Mountain Climbers", icon: "⛰️", duration: "10 min", calories: 100, desc: "Core + cardio combo", blockedFor: ["heart_disease", "knee_pain"] },
        ],
        park: [
            { name: "Sprint Running", icon: "🏃", duration: "20 min", calories: 180, desc: "Speed intervals on track", blockedFor: ["heart_disease", "knee_pain"] },
            { name: "Football / Cricket", icon: "⚽", duration: "45 min", calories: 250, desc: "Team sports for fitness", blockedFor: [] },
            { name: "Cycling", icon: "🚲", duration: "30 min", calories: 150, desc: "Endurance cycling", blockedFor: [] },
            { name: "Pull-ups on Bars", icon: "🤸", duration: "15 min", calories: 80, desc: "Calisthenics upper body", blockedFor: [] },
            { name: "Basketball", icon: "🏀", duration: "30 min", calories: 200, desc: "Full body sport", blockedFor: ["knee_pain"] },
        ],
        gym: [
            { name: "Bench Press", icon: "🏋️", duration: "30 min", calories: 150, desc: "Chest strength training", blockedFor: [] },
            { name: "Pull-ups", icon: "🤸", duration: "15 min", calories: 80, desc: "Back & bicep builder", blockedFor: [] },
            { name: "Leg Press", icon: "🦵", duration: "20 min", calories: 100, desc: "Machine leg strengthening", blockedFor: ["knee_pain"] },
            { name: "Dumbbell Curls", icon: "💪", duration: "15 min", calories: 60, desc: "Bicep isolation", blockedFor: [] },
            { name: "Treadmill Running", icon: "🏃", duration: "30 min", calories: 250, desc: "Cardio endurance", blockedFor: ["heart_disease", "knee_pain"] },
        ],
        yoga: [
            { name: "Surya Namaskar", icon: "🌅", duration: "20 min", calories: 120, desc: "12-step full body flow", blockedFor: [] },
            { name: "Cobra Pose", icon: "🐍", duration: "5 min", calories: 15, desc: "Backbend and spinal strength", blockedFor: [] },
            { name: "Warrior Pose", icon: "⚔️", duration: "10 min", calories: 30, desc: "Leg and core strength", blockedFor: [] },
            { name: "Bridge Pose", icon: "🌉", duration: "5 min", calories: 20, desc: "Glute and lower back strength", blockedFor: [] },
            { name: "Boat Pose", icon: "⛵", duration: "5 min", calories: 25, desc: "Core strength", blockedFor: [] },
        ],
        pool: [
            { name: "Freestyle Swimming", icon: "🏊", duration: "30 min", calories: 220, desc: "Full body swim", blockedFor: [] },
            { name: "Breaststroke", icon: "🏊", duration: "20 min", calories: 180, desc: "Chest and legs swim style", blockedFor: [] },
            { name: "Backstroke", icon: "🏊", duration: "20 min", calories: 160, desc: "Back and arm swimmer", blockedFor: [] },
            { name: "Kickboard Training", icon: "🦵", duration: "15 min", calories: 90, desc: "Leg kick strength training", blockedFor: [] },
            { name: "Water Jogging", icon: "🚶", duration: "20 min", calories: 100, desc: "Resistance cardio in water", blockedFor: ["knee_pain"] },
        ],
    },

    // ─── YOUNG ADULTS 21-30 ──────────────────────────────────────────────────
    "21-30": {
        home: [
            { name: "Push-ups", icon: "💪", duration: "15 min", calories: 90, desc: "3 sets × 20 reps", blockedFor: [] },
            { name: "Squats", icon: "🦵", duration: "15 min", calories: 100, desc: "3 sets × 25 reps", blockedFor: ["knee_pain"] },
            { name: "Lunges", icon: "🚶", duration: "10 min", calories: 80, desc: "Walking lunges, 3 sets × 12 each side", blockedFor: ["knee_pain"] },
            { name: "Plank", icon: "🧱", duration: "10 min", calories: 55, desc: "3 sets × 1.5 min hold", blockedFor: [] },
            { name: "Burpees", icon: "💥", duration: "10 min", calories: 150, desc: "Full body HIIT exercise", blockedFor: ["heart_disease", "hypertension", "knee_pain"] },
        ],
        park: [
            { name: "Jogging", icon: "🏃", duration: "30 min", calories: 240, desc: "Steady pace run", blockedFor: ["heart_disease", "knee_pain"] },
            { name: "Sprint Intervals", icon: "⚡", duration: "20 min", calories: 200, desc: "30s sprint, 30s walk repeats", blockedFor: ["heart_disease", "hypertension", "knee_pain"] },
            { name: "Cycling", icon: "🚲", duration: "30 min", calories: 180, desc: "Endurance cycling", blockedFor: [] },
            { name: "Football", icon: "⚽", duration: "45 min", calories: 300, desc: "Team sport", blockedFor: ["knee_pain"] },
            { name: "Calisthenics on Bars", icon: "🤸", duration: "20 min", calories: 120, desc: "Pull-ups, dips, leg raises", blockedFor: [] },
        ],
        gym: [
            { name: "Deadlifts", icon: "🏋️", duration: "30 min", calories: 180, desc: "Full body compound lift", blockedFor: ["knee_pain", "heart_disease"] },
            { name: "Bench Press", icon: "💪", duration: "30 min", calories: 150, desc: "Chest strength", blockedFor: [] },
            { name: "Lat Pulldown", icon: "🤸", duration: "20 min", calories: 100, desc: "Back width training", blockedFor: [] },
            { name: "Shoulder Press", icon: "🦾", duration: "20 min", calories: 90, desc: "Overhead press", blockedFor: ["hypertension"] },
            { name: "Treadmill Running", icon: "🏃", duration: "30 min", calories: 270, desc: "Cardio endurance", blockedFor: ["heart_disease", "knee_pain"] },
        ],
        yoga: [
            { name: "Surya Namaskar", icon: "🌅", duration: "20 min", calories: 130, desc: "12-step sun salutation", blockedFor: [] },
            { name: "Warrior Pose", icon: "⚔️", duration: "10 min", calories: 35, desc: "Strength and balance", blockedFor: [] },
            { name: "Downward Dog", icon: "🐕", duration: "5 min", calories: 20, desc: "Full body stretch", blockedFor: [] },
            { name: "Triangle Pose", icon: "🔺", duration: "5 min", calories: 15, desc: "Side body stretch", blockedFor: [] },
            { name: "Boat Pose", icon: "⛵", duration: "5 min", calories: 28, desc: "Core strength", blockedFor: [] },
        ],
        pool: [
            { name: "Freestyle Swimming", icon: "🏊", duration: "30 min", calories: 250, desc: "Fast freestyle laps", blockedFor: [] },
            { name: "Breaststroke", icon: "🏊", duration: "25 min", calories: 200, desc: "Full body swim", blockedFor: [] },
            { name: "Backstroke", icon: "🏊", duration: "20 min", calories: 170, desc: "Back muscles focus", blockedFor: [] },
            { name: "Butterfly Stroke", icon: "🦋", duration: "20 min", calories: 280, desc: "High intensity swim", blockedFor: ["heart_disease", "hypertension"] },
            { name: "Water Aerobics", icon: "💦", duration: "30 min", calories: 150, desc: "Low impact cardio", blockedFor: [] },
        ],
    },

    // ─── ADULTS 31-40 ────────────────────────────────────────────────────────
    "31-40": {
        home: [
            { name: "Light Squats", icon: "🦵", duration: "15 min", calories: 85, desc: "Bodyweight squats, 3 × 20", blockedFor: ["knee_pain"] },
            { name: "Push-ups", icon: "💪", duration: "15 min", calories: 80, desc: "3 sets × 15 reps", blockedFor: [] },
            { name: "Lunges", icon: "🚶", duration: "10 min", calories: 75, desc: "Alternating lunges for balance", blockedFor: ["knee_pain"] },
            { name: "Plank", icon: "🧱", duration: "10 min", calories: 50, desc: "Hold for core strength", blockedFor: [] },
            { name: "Burpees", icon: "💥", duration: "10 min", calories: 130, desc: "Modified, no jump if needed", blockedFor: ["heart_disease", "hypertension", "knee_pain"] },
        ],
        park: [
            { name: "Brisk Walking", icon: "🚶", duration: "30 min", calories: 140, desc: "Fast pace walk", blockedFor: [] },
            { name: "Light Jogging", icon: "🏃", duration: "25 min", calories: 180, desc: "Easy jog pace", blockedFor: ["heart_disease", "knee_pain"] },
            { name: "Cycling", icon: "🚲", duration: "30 min", calories: 160, desc: "Leisure cycle", blockedFor: [] },
            { name: "Badminton", icon: "🏸", duration: "30 min", calories: 170, desc: "Racquet sport", blockedFor: ["knee_pain"] },
            { name: "Stretching Outdoors", icon: "🤸", duration: "15 min", calories: 30, desc: "Full body flexibility", blockedFor: [] },
        ],
        gym: [
            { name: "Light Weight Training", icon: "🏋️", duration: "40 min", calories: 160, desc: "Moderate weight, higher reps", blockedFor: ["heart_disease"] },
            { name: "Elliptical", icon: "🔄", duration: "30 min", calories: 220, desc: "Low impact cardio", blockedFor: [] },
            { name: "Cycling Machine", icon: "🚲", duration: "30 min", calories: 180, desc: "Stationary bike", blockedFor: [] },
            { name: "Leg Press", icon: "🦵", duration: "20 min", calories: 100, desc: "Machine, controlled range", blockedFor: ["knee_pain"] },
            { name: "Rowing Machine", icon: "🚣", duration: "20 min", calories: 160, desc: "Full body low impact", blockedFor: [] },
        ],
        yoga: [
            { name: "Surya Namaskar", icon: "🌅", duration: "20 min", calories: 120, desc: "Full salutation flow", blockedFor: [] },
            { name: "Warrior Pose", icon: "⚔️", duration: "10 min", calories: 30, desc: "Strength and stability", blockedFor: [] },
            { name: "Downward Dog", icon: "🐕", duration: "5 min", calories: 18, desc: "Full body stretch", blockedFor: [] },
            { name: "Bridge Pose", icon: "🌉", duration: "5 min", calories: 20, desc: "Lower back & glutes", blockedFor: [] },
            { name: "Pranayama Breathing", icon: "🌬️", duration: "15 min", calories: 10, desc: "Breathing techniques", blockedFor: [] },
        ],
        pool: [
            { name: "Freestyle Swimming", icon: "🏊", duration: "30 min", calories: 230, desc: "Lap swimming", blockedFor: [] },
            { name: "Breaststroke", icon: "🏊", duration: "25 min", calories: 190, desc: "Moderate intensity swim", blockedFor: [] },
            { name: "Backstroke", icon: "🏊", duration: "20 min", calories: 160, desc: "Back strength focus", blockedFor: [] },
            { name: "Water Aerobics", icon: "💦", duration: "30 min", calories: 140, desc: "Joint-friendly cardio", blockedFor: [] },
            { name: "Aqua Jogging", icon: "🚶", duration: "25 min", calories: 130, desc: "Running in water", blockedFor: ["knee_pain"] },
        ],
    },

    // ─── ADULTS 41-50 ────────────────────────────────────────────────────────
    "41-50": {
        home: [
            { name: "Brisk Walking in Place", icon: "🚶", duration: "20 min", calories: 90, desc: "Indoor walking for cardio", blockedFor: [] },
            { name: "Wall Push-ups", icon: "🤲", duration: "10 min", calories: 40, desc: "Gentle upper body", blockedFor: [] },
            { name: "Chair Squats", icon: "🪑", duration: "10 min", calories: 50, desc: "Use chair for support", blockedFor: ["knee_pain"] },
            { name: "Stretching Routine", icon: "🤸", duration: "15 min", calories: 25, desc: "Full body flexibility", blockedFor: [] },
            { name: "Resistance Band Exercises", icon: "💪", duration: "15 min", calories: 60, desc: "Arms and back with band", blockedFor: [] },
        ],
        park: [
            { name: "Walking", icon: "🚶", duration: "30 min", calories: 120, desc: "Regular pace walk", blockedFor: [] },
            { name: "Yoga Outdoors", icon: "🧘", duration: "30 min", calories: 80, desc: "Gentle yoga in open air", blockedFor: [] },
            { name: "Light Cycling", icon: "🚲", duration: "25 min", calories: 110, desc: "Easy pace cycle", blockedFor: [] },
            { name: "Badminton", icon: "🏸", duration: "20 min", calories: 100, desc: "Moderate racquet sport", blockedFor: ["knee_pain", "heart_disease"] },
            { name: "Stretching", icon: "🤸", duration: "15 min", calories: 20, desc: "Park bench stretch", blockedFor: [] },
        ],
        gym: [
            { name: "Light Weight Training", icon: "🏋️", duration: "30 min", calories: 130, desc: "Low weight, high rep", blockedFor: ["heart_disease"] },
            { name: "Cycling Machine", icon: "🚲", duration: "30 min", calories: 150, desc: "Stationary bike, low resistance", blockedFor: [] },
            { name: "Elliptical", icon: "🔄", duration: "25 min", calories: 170, desc: "Zero impact cardio", blockedFor: [] },
            { name: "Core Exercises", icon: "🧱", duration: "15 min", calories: 60, desc: "Plank, bird-dog, deadbug", blockedFor: [] },
            { name: "Rowing Machine", icon: "🚣", duration: "20 min", calories: 140, desc: "Low impact full body", blockedFor: [] },
        ],
        yoga: [
            { name: "Surya Namaskar (Slow)", icon: "🌅", duration: "20 min", calories: 90, desc: "Slow-paced sun salutation", blockedFor: [] },
            { name: "Tree Pose", icon: "🌳", duration: "5 min", calories: 10, desc: "Balance and focus", blockedFor: [] },
            { name: "Cobra Pose", icon: "🐍", duration: "5 min", calories: 12, desc: "Spinal flexibility", blockedFor: [] },
            { name: "Bridge Pose", icon: "🌉", duration: "5 min", calories: 18, desc: "Hip and back strength", blockedFor: [] },
            { name: "Pranayama Breathing", icon: "🌬️", duration: "20 min", calories: 10, desc: "Deep breathing techniques", blockedFor: [] },
        ],
        pool: [
            { name: "Slow Swimming", icon: "🏊", duration: "25 min", calories: 170, desc: "Easy lap swimming", blockedFor: [] },
            { name: "Water Walking", icon: "🚶", duration: "20 min", calories: 80, desc: "Walk in shoulder-depth water", blockedFor: [] },
            { name: "Water Aerobics", icon: "💦", duration: "25 min", calories: 120, desc: "Low impact pool exercise", blockedFor: [] },
            { name: "Floating Exercise", icon: "🛟", duration: "10 min", calories: 20, desc: "Relax and stretch in water", blockedFor: [] },
            { name: "Leg Kicks in Water", icon: "🦵", duration: "15 min", calories: 60, desc: "Holding wall, kick for leg strength", blockedFor: [] },
        ],
    },

    // ─── ADULTS 51-60 ────────────────────────────────────────────────────────
    "51-60": {
        home: [
            { name: "Brisk Walking in Place", icon: "🚶", duration: "20 min", calories: 80, desc: "Moderate indoor cardio", blockedFor: [] },
            { name: "Wall Push-ups", icon: "🤲", duration: "10 min", calories: 35, desc: "Gentle chest & shoulders", blockedFor: [] },
            { name: "Chair Squats", icon: "🪑", duration: "10 min", calories: 45, desc: "Sit to stand with chair support", blockedFor: ["knee_pain"] },
            { name: "Light Dumbbell Curls", icon: "💪", duration: "10 min", calories: 40, desc: "1–3 kg dumbbells, 3 × 12", blockedFor: ["heart_disease"] },
            { name: "Stretching", icon: "🤸", duration: "15 min", calories: 22, desc: "Morning full body stretch", blockedFor: [] },
        ],
        park: [
            { name: "Brisk Walking", icon: "🚶", duration: "30 min", calories: 110, desc: "Steady fast walk", blockedFor: [] },
            { name: "Yoga Outdoors", icon: "🧘", duration: "30 min", calories: 70, desc: "Outdoor yoga session", blockedFor: [] },
            { name: "Light Cycling", icon: "🚲", duration: "20 min", calories: 90, desc: "Flat surface easy cycle", blockedFor: [] },
            { name: "Stretching", icon: "🤸", duration: "15 min", calories: 18, desc: "Full body outdoor stretch", blockedFor: [] },
            { name: "Slow Jogging", icon: "🏃", duration: "15 min", calories: 100, desc: "Gentle jog if comfortable", blockedFor: ["heart_disease", "knee_pain", "hypertension"] },
        ],
        gym: [
            { name: "Cycling Machine", icon: "🚲", duration: "25 min", calories: 130, desc: "Low resistance stationary bike", blockedFor: [] },
            { name: "Elliptical", icon: "🔄", duration: "20 min", calories: 140, desc: "No impact cardio", blockedFor: [] },
            { name: "Light Weight Training", icon: "🏋️", duration: "25 min", calories: 100, desc: "Very light weights, focus form", blockedFor: ["heart_disease", "hypertension"] },
            { name: "Leg Press", icon: "🦵", duration: "15 min", calories: 70, desc: "Low weight machine", blockedFor: ["knee_pain"] },
            { name: "Rowing Machine", icon: "🚣", duration: "15 min", calories: 110, desc: "Moderate resistance", blockedFor: [] },
        ],
        yoga: [
            { name: "Surya Namaskar (Slow)", icon: "🌅", duration: "20 min", calories: 80, desc: "Gentle paced sun salutation", blockedFor: [] },
            { name: "Tree Pose", icon: "🌳", duration: "5 min", calories: 8, desc: "Balance with wall support", blockedFor: [] },
            { name: "Cobra Pose", icon: "🐍", duration: "5 min", calories: 10, desc: "Easy backbend", blockedFor: [] },
            { name: "Bridge Pose", icon: "🌉", duration: "5 min", calories: 15, desc: "Hip opening", blockedFor: [] },
            { name: "Pranayama Breathing", icon: "🌬️", duration: "20 min", calories: 8, desc: "Anulom vilom, deep breathing", blockedFor: [] },
        ],
        pool: [
            { name: "Slow Swimming", icon: "🏊", duration: "20 min", calories: 140, desc: "Easy lap swim", blockedFor: [] },
            { name: "Water Walking", icon: "🚶", duration: "20 min", calories: 70, desc: "Waist-deep water walk", blockedFor: [] },
            { name: "Water Aerobics", icon: "💦", duration: "20 min", calories: 100, desc: "Gentle pool exercises", blockedFor: [] },
            { name: "Floating", icon: "🛟", duration: "10 min", calories: 15, desc: "Back float relaxation", blockedFor: [] },
            { name: "Leg Kicks (pool edge)", icon: "🦵", duration: "10 min", calories: 45, desc: "Kick legs holding pool wall", blockedFor: [] },
        ],
    },

    // ─── SENIORS 61-70 ───────────────────────────────────────────────────────
    "61-70": {
        home: [
            { name: "Chair Squats", icon: "🪑", duration: "10 min", calories: 35, desc: "Sit to stand slowly, 3 × 8", blockedFor: ["knee_pain"] },
            { name: "Wall Push-ups", icon: "🤲", duration: "10 min", calories: 25, desc: "Hands on wall, gentle push", blockedFor: [] },
            { name: "Light Stretching", icon: "🤸", duration: "15 min", calories: 15, desc: "Head to toe stretch routine", blockedFor: [] },
            { name: "Resistance Band Arms", icon: "💪", duration: "10 min", calories: 30, desc: "Seated arm curls with band", blockedFor: ["heart_disease"] },
            { name: "Standing Calf Raises", icon: "🦵", duration: "5 min", calories: 15, desc: "Hold chair, rise on toes", blockedFor: [] },
        ],
        park: [
            { name: "Brisk Walking", icon: "🚶", duration: "25 min", calories: 90, desc: "Fast but comfortable walk", blockedFor: [] },
            { name: "Light Cycling", icon: "🚲", duration: "20 min", calories: 80, desc: "Easy park cycle", blockedFor: [] },
            { name: "Tai Chi Movements", icon: "☯️", duration: "20 min", calories: 50, desc: "Slow flow movements for balance", blockedFor: [] },
            { name: "Balance Walking", icon: "🧘", duration: "10 min", calories: 30, desc: "Heel-to-toe line walk", blockedFor: [] },
            { name: "Light Stretching", icon: "🤸", duration: "10 min", calories: 12, desc: "Park bench stretch", blockedFor: [] },
        ],
        yoga: [
            { name: "Gentle Surya Namaskar", icon: "🌅", duration: "15 min", calories: 55, desc: "Slow, modified salutation", blockedFor: [] },
            { name: "Tree Pose (with support)", icon: "🌳", duration: "5 min", calories: 8, desc: "Hold wall for safety", blockedFor: [] },
            { name: "Cat-Cow Stretch", icon: "🐱", duration: "5 min", calories: 10, desc: "Floor spinal mobility", blockedFor: [] },
            { name: "Cobra Pose", icon: "🐍", duration: "5 min", calories: 10, desc: "Gentle backbend", blockedFor: [] },
            { name: "Pranayama Breathing", icon: "🌬️", duration: "20 min", calories: 8, desc: "Deep breathing exercises", blockedFor: [] },
        ],
        pool: [
            { name: "Slow Freestyle", icon: "🏊", duration: "20 min", calories: 110, desc: "Easy lap swimming", blockedFor: [] },
            { name: "Water Walking", icon: "🚶", duration: "20 min", calories: 60, desc: "Walk in waist-deep water", blockedFor: [] },
            { name: "Water Aerobics", icon: "💦", duration: "20 min", calories: 80, desc: "Gentle water exercises", blockedFor: [] },
            { name: "Leg Kicks (pool edge)", icon: "🦵", duration: "10 min", calories: 35, desc: "Hold wall, gentle kicks", blockedFor: [] },
            { name: "Floating Balance", icon: "🛟", duration: "10 min", calories: 15, desc: "Float and balance practice", blockedFor: [] },
        ],
    },

    // ─── SENIORS 71-80 ───────────────────────────────────────────────────────
    "71-80": {
        home: [
            { name: "Chair Sit-to-Stand", icon: "🪑", duration: "10 min", calories: 25, desc: "Slow rise from chair, 3 × 8", blockedFor: ["knee_pain"] },
            { name: "Wall Push-ups", icon: "🤲", duration: "8 min", calories: 18, desc: "Very gentle upper body", blockedFor: [] },
            { name: "Arm Circles", icon: "🔄", duration: "5 min", calories: 10, desc: "Shoulder mobility exercise", blockedFor: [] },
            { name: "Seated Leg Lifts", icon: "🦵", duration: "8 min", calories: 15, desc: "Sit and lift each leg gently", blockedFor: [] },
            { name: "Gentle Stretching", icon: "🤸", duration: "15 min", calories: 12, desc: "Slow full body stretch", blockedFor: [] },
        ],
        park: [
            { name: "Slow Walking", icon: "🚶", duration: "20 min", calories: 60, desc: "Comfortable pace walk", blockedFor: [] },
            { name: "Light Balance Exercises", icon: "☯️", duration: "10 min", calories: 20, desc: "Tai Chi style balance", blockedFor: [] },
            { name: "Stretching in Open Air", icon: "🤸", duration: "10 min", calories: 10, desc: "Outdoor gentle stretch", blockedFor: [] },
            { name: "Slow Cycling", icon: "🚲", duration: "15 min", calories: 50, desc: "Only if comfortable and safe", blockedFor: ["knee_pain", "heart_disease"] },
            { name: "Tai Chi Practice", icon: "☯️", duration: "20 min", calories: 45, desc: "Slow mindful movements", blockedFor: [] },
        ],
        yoga: [
            { name: "Chair Yoga", icon: "🧘", duration: "20 min", calories: 30, desc: "Seated yoga sequences", blockedFor: [] },
            { name: "Cat-Cow Stretch", icon: "🐱", duration: "5 min", calories: 8, desc: "Seated or floor version", blockedFor: [] },
            { name: "Seated Forward Bend", icon: "🙏", duration: "5 min", calories: 6, desc: "Gentle hamstring stretch", blockedFor: [] },
            { name: "Breathing Meditation", icon: "🌬️", duration: "20 min", calories: 5, desc: "Mindful breathing", blockedFor: [] },
            { name: "Gentle Spinal Twist", icon: "🔄", duration: "5 min", calories: 8, desc: "Seated spinal rotation", blockedFor: [] },
        ],
        pool: [
            { name: "Water Walking", icon: "🚶", duration: "15 min", calories: 45, desc: "Chest-deep water walk", blockedFor: [] },
            { name: "Floating Exercises", icon: "🛟", duration: "10 min", calories: 12, desc: "Relax and float", blockedFor: [] },
            { name: "Gentle Kicks (edge)", icon: "🦵", duration: "10 min", calories: 25, desc: "Hold pool wall, gentle kicks", blockedFor: [] },
            { name: "Arm Movements in Water", icon: "💪", duration: "10 min", calories: 20, desc: "Resistance arm sweeps", blockedFor: [] },
            { name: "Light Assisted Swimming", icon: "🏊", duration: "15 min", calories: 55, desc: "Slow lap with rest breaks", blockedFor: ["heart_disease"] },
        ],
    },

    // ─── SENIORS 81-90 ───────────────────────────────────────────────────────
    "81-90": {
        home: [
            { name: "Seated Leg Raises", icon: "🦵", duration: "8 min", calories: 10, desc: "Sit and gently raise each leg", blockedFor: [] },
            { name: "Hand Grip Exercises", icon: "✊", duration: "5 min", calories: 5, desc: "Squeeze soft ball or hands", blockedFor: [] },
            { name: "Arm Stretches", icon: "🙆", duration: "8 min", calories: 8, desc: "Overhead and side arm reach", blockedFor: [] },
            { name: "Neck Mobility", icon: "🔄", duration: "5 min", calories: 5, desc: "Slow neck turns and tilts", blockedFor: [] },
            { name: "Breathing Exercises", icon: "🌬️", duration: "10 min", calories: 4, desc: "Deep belly breathing", blockedFor: [] },
        ],
        park: [
            { name: "Very Slow Walking", icon: "🚶", duration: "15 min", calories: 35, desc: "Short, comfortable walk", blockedFor: [] },
            { name: "Sitting Stretches", icon: "🤸", duration: "10 min", calories: 8, desc: "Stretch seated on bench", blockedFor: [] },
            { name: "Balance Practice", icon: "☯️", duration: "8 min", calories: 10, desc: "Supported standing balance", blockedFor: [] },
            { name: "Sunlight Breathing", icon: "☀️", duration: "10 min", calories: 3, desc: "Breathe deeply in fresh air", blockedFor: [] },
            { name: "Light Arm Movements", icon: "💪", duration: "8 min", calories: 8, desc: "Gentle arm swings & circles", blockedFor: [] },
        ],
        yoga: [
            { name: "Chair Yoga", icon: "🧘", duration: "15 min", calories: 20, desc: "Gentle seated yoga", blockedFor: [] },
            { name: "Gentle Stretching", icon: "🤸", duration: "10 min", calories: 8, desc: "Seated full body stretch", blockedFor: [] },
            { name: "Deep Breathing", icon: "🌬️", duration: "15 min", calories: 4, desc: "Pranayama for lungs", blockedFor: [] },
            { name: "Guided Relaxation", icon: "😌", duration: "15 min", calories: 2, desc: "Body scan relaxation", blockedFor: [] },
            { name: "Light Shoulder Mobility", icon: "🔄", duration: "5 min", calories: 6, desc: "Shoulder rolls and circles", blockedFor: [] },
        ],
        pool: [
            { name: "Water Walking (assisted)", icon: "🚶", duration: "12 min", calories: 30, desc: "With support rail, shallow end", blockedFor: [] },
            { name: "Floating Practice", icon: "🛟", duration: "10 min", calories: 8, desc: "Supervised floating", blockedFor: [] },
            { name: "Gentle Leg Movement", icon: "🦵", duration: "8 min", calories: 15, desc: "Seated pool edge leg movement", blockedFor: [] },
            { name: "Assisted Swimming", icon: "🏊", duration: "10 min", calories: 35, desc: "Pool noodle assisted swim", blockedFor: ["heart_disease"] },
            { name: "Light Water Stretching", icon: "🤸", duration: "10 min", calories: 10, desc: "Standing water stretches", blockedFor: [] },
        ],
    },

    // ─── SENIORS 91-100 ──────────────────────────────────────────────────────
    "91-100": {
        home: [
            { name: "Assisted Walking", icon: "🚶", duration: "8 min", calories: 15, desc: "Short indoor walk with support", blockedFor: [] },
            { name: "Finger & Hand Exercises", icon: "✋", duration: "5 min", calories: 3, desc: "Finger opens/closes, wrist rolls", blockedFor: [] },
            { name: "Gentle Arm Movements", icon: "🙆", duration: "5 min", calories: 5, desc: "Slow arm lifts and lowering", blockedFor: [] },
            { name: "Breathing Exercises", icon: "🌬️", duration: "10 min", calories: 3, desc: "Slow deep breaths", blockedFor: [] },
            { name: "Light Seated Stretching", icon: "🤸", duration: "8 min", calories: 4, desc: "Neck, shoulder, ankle stretch", blockedFor: [] },
        ],
        park: [
            { name: "Short Assisted Walking", icon: "🚶", duration: "8 min", calories: 15, desc: "Very short walk with support", blockedFor: [] },
            { name: "Sitting Breathing", icon: "🌬️", duration: "10 min", calories: 2, desc: "Deep breathing on bench", blockedFor: [] },
            { name: "Sunlight Stretching", icon: "☀️", duration: "8 min", calories: 4, desc: "Gentle stretch in morning sun", blockedFor: [] },
            { name: "Hand Mobility Exercises", icon: "✋", duration: "5 min", calories: 3, desc: "Hand and wrist exercises", blockedFor: [] },
            { name: "Relaxation Exercises", icon: "😌", duration: "10 min", calories: 2, desc: "Mindful relaxation outdoors", blockedFor: [] },
        ],
        yoga: [
            { name: "Chair Breathing Meditation", icon: "🌬️", duration: "15 min", calories: 2, desc: "Seated mindfulness breathing", blockedFor: [] },
            { name: "Gentle Neck Movement", icon: "🔄", duration: "5 min", calories: 3, desc: "Slow neck tilts each side", blockedFor: [] },
            { name: "Guided Relaxation", icon: "😌", duration: "15 min", calories: 2, desc: "Complete body relaxation", blockedFor: [] },
            { name: "Assisted Stretching", icon: "🤸", duration: "8 min", calories: 4, desc: "Caregiver-assisted gentle stretch", blockedFor: [] },
            { name: "Very Light Chair Yoga", icon: "🧘", duration: "10 min", calories: 5, desc: "Seated arm and leg movements", blockedFor: [] },
        ],
        pool: [
            { name: "Assisted Floating", icon: "🛟", duration: "10 min", calories: 5, desc: "Supervised float with noodle", blockedFor: [] },
            { name: "Gentle Water Walking", icon: "🚶", duration: "8 min", calories: 15, desc: "Very slow walk in shallow water", blockedFor: [] },
            { name: "Light Leg Movements", icon: "🦵", duration: "8 min", calories: 8, desc: "Seated pool steps leg movement", blockedFor: [] },
            { name: "Warm Water Therapy", icon: "🌊", duration: "15 min", calories: 5, desc: "Relax in warm water", blockedFor: [] },
            { name: "Assisted Water Stretching", icon: "🤸", duration: "8 min", calories: 6, desc: "Stretch with caregiver support", blockedFor: [] },
        ],
    },
};

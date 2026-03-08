// Baby Food Database — Ages 0-5
// Feeding guide with food items, quantities, and nutritional notes

export const BABY_FOOD_DB = {
    "0-1": {
        activityNote: "At this stage, 'exercise' means gentle stimulation — massage, tummy time, and assisted movement by a parent or caregiver.",
        safetyNote: "All activities require parent/caregiver supervision. Never leave baby unattended during any activity.",
        feeding: [
            {
                phase: "0–6 Months",
                icon: "🤱",
                color: "from-pink-400 to-rose-500",
                foods: [
                    { item: "Breast Milk", quantity: "On demand (every 2–3 hrs)", note: "Primary and complete nutrition — breast is best" },
                    { item: "Formula Milk (if needed)", quantity: "60–120 ml per feed", note: "Use only if breastfeeding is not possible" },
                ],
                importantNote: "No solid food before 6 months. Breast milk alone is sufficient."
            },
            {
                phase: "6–12 Months",
                icon: "🥣",
                color: "from-amber-400 to-orange-500",
                foods: [
                    { item: "Breast Milk / Formula", quantity: "On demand or 180–240 ml", note: "Continue as main nutrition" },
                    { item: "Mashed Banana", quantity: "2–3 teaspoons", note: "Rich in potassium and carbohydrates" },
                    { item: "Rice Puree", quantity: "2–3 teaspoons", note: "Easy to digest first grain" },
                    { item: "Soft Dal Water", quantity: "2–3 teaspoons", note: "Protein introduction" },
                    { item: "Vegetable Puree (Carrot, Potato)", quantity: "2–3 teaspoons", note: "Vitamins and minerals" },
                    { item: "Apple/Pear Puree", quantity: "1–2 teaspoons", note: "Fiber and natural sweetness" },
                ],
                importantNote: "Introduce one new food every 3–5 days. Watch for allergies."
            }
        ],
    },

    "1-2": {
        activityNote: "Toddlers love to move! Encourage walking, playing, and dancing. All activities should be supervised.",
        safetyNote: "Baby-proof the area. Never leave unattended near water or heights.",
        feeding: [
            {
                phase: "12–24 Months",
                icon: "🍚",
                color: "from-green-400 to-emerald-500",
                foods: [
                    { item: "Cow Milk / Breast Milk", quantity: "400–500 ml daily", note: "Calcium and protein for bone growth" },
                    { item: "Soft Rice + Dal (Khichdi)", quantity: "3–4 tablespoons per meal", note: "Complete protein + carbs" },
                    { item: "Mashed Vegetables", quantity: "2–3 tablespoons", note: "Iron, vitamins" },
                    { item: "Banana / Apple", quantity: "Half fruit per day", note: "Natural energy and fiber" },
                    { item: "Curd (plain)", quantity: "2–3 tablespoons", note: "Probiotics and calcium" },
                    { item: "Egg Yolk (soft boiled)", quantity: "1 yolk daily", note: "High protein and DHA for brain" },
                ],
                importantNote: "3 small meals + 2 healthy snacks per day. Textures should be soft and mashable."
            }
        ],
    },

    "2-3": {
        activityNote: "Active play time! Running, jumping, and group play are wonderful at this age.",
        safetyNote: "Supervision required for all outdoor activities. Protect from sun and falls.",
        feeding: [
            {
                phase: "2–3 Years",
                icon: "🍱",
                color: "from-blue-400 to-cyan-500",
                foods: [
                    { item: "Milk", quantity: "400 ml daily", note: "Full-fat milk for growing bones" },
                    { item: "Rice / Roti", quantity: "Small bowl per meal", note: "Complex carbohydrate energy" },
                    { item: "Dal / Lentils", quantity: "Half katori per meal", note: "Plant protein" },
                    { item: "Fresh Fruits", quantity: "1 serving (1 small fruit)", note: "Vitamins and fiber" },
                    { item: "Vegetables (sabzi)", quantity: "Half katori per meal", note: "Micronutrients" },
                    { item: "Egg or Paneer", quantity: "1 egg or 30g paneer", note: "Complete animal or dairy protein" },
                ],
                importantNote: "3 meals + 2 snacks. Avoid processed foods, excess sugar, and salt."
            }
        ],
    },

    "3-4": {
        activityNote: "Playground time and structured play. Start introducing group games and basic sports.",
        safetyNote: "Ensure safe play equipment. Helmet for cycling. Sun protection outdoors.",
        feeding: [
            {
                phase: "3–4 Years",
                icon: "🥗",
                color: "from-violet-400 to-purple-500",
                foods: [
                    { item: "Milk", quantity: "400–500 ml daily", note: "Calcium for bones and teeth" },
                    { item: "Roti / Rice", quantity: "1 small roti or 1 katori rice per meal", note: "Energy from complex carbs" },
                    { item: "Dal / Rajma / Chana", quantity: "1 katori per day", note: "Protein and iron" },
                    { item: "Green Vegetables", quantity: "Half katori per meal", note: "Iron, folate, vitamins" },
                    { item: "Egg / Chicken (non-veg)", quantity: "1 egg or 30g meat", note: "Complete protein" },
                    { item: "Fresh Fruits", quantity: "2 servings per day", note: "Vitamin C and antioxidants" },
                ],
                importantNote: "3 meals + 2 snacks. Good snacks: peanuts, chikki, fruits, yogurt, roasted chana."
            }
        ],
    },

    "4-5": {
        activityNote: "More active and social! Team games, cycling, and skipping rope are great at this age.",
        safetyNote: "Always wear helmet for cycling. Warm up before exercise. 20–30 min recommended daily.",
        feeding: [
            {
                phase: "4–5 Years",
                icon: "🍽️",
                color: "from-orange-400 to-red-500",
                foods: [
                    { item: "Milk", quantity: "400 ml daily", note: "Calcium, Vitamin D, protein" },
                    { item: "Eggs / Paneer", quantity: "1–2 eggs or 50g paneer", note: "High quality protein" },
                    { item: "Rice / Roti", quantity: "1–2 rotis or medium katori rice per meal", note: "Energy" },
                    { item: "Dal / Sabzi", quantity: "1 katori each per day", note: "Protein + fiber + vitamins" },
                    { item: "Fruits", quantity: "2 servings per day", note: "Vitamins and fiber" },
                    { item: "Healthy Snacks", quantity: "2 small snacks", note: "Chikki, dry fruits, sprouts, yogurt" },
                ],
                importantNote: "3 main meals + 2 healthy snacks. This is school age — pack nutritious tiffin!"
            }
        ],
    },
};

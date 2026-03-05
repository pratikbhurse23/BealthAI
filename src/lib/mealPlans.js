// Simple rule-based meal plan generator
// Exports: generateWeeklyPlan(profile, budget)

function pickMealsForPreference(pref) {
    const lists = {
        Veg: {
            breakfast: ['Oats with milk and banana', 'Poha with peanuts', 'Upma with veggies', 'Idli with sambar'],
            lunch: ['Vegetable curry with rice', 'Dal, roti, mixed sabzi', 'Paneer curry with rice', 'Chickpea curry with roti'],
            dinner: ['Mixed vegetable stir-fry with roti', 'Dal khichdi', 'Grilled paneer salad', 'Vegetable soup + bread'],
            snack: ['Fruit bowl', 'Yogurt with honey', 'Roasted chana']
        },
        'Non-Veg': {
            breakfast: ['Egg omelette with toast', 'Poha with peanuts', 'Egg sandwich', 'Paratha with curd'],
            lunch: ['Grilled chicken with rice', 'Fish curry with rice', 'Chicken curry + roti', 'Egg pulao with salad'],
            dinner: ['Grilled fish with salad', 'Chicken soup + roti', 'Egg bhurji with veggies', 'Tandoori chicken with veggies'],
            snack: ['Boiled egg', 'Fruits', 'Nuts']
        },
        Vegan: {
            breakfast: ['Oats with almond milk and banana', 'Smoothie bowl', 'Tofu scramble with toast', 'Chia pudding with fruit'],
            lunch: ['Lentil stew with rice', 'Tofu curry with roti', 'Chickpea salad with quinoa', 'Veggie wrap with hummus'],
            dinner: ['Stir-fried tofu with veggies', 'Vegan chili with rice', 'Lentil soup + bread', 'Quinoa salad with beans'],
            snack: ['Fruit', 'Roasted seeds', 'Hummus with veggies']
        },
        Jain: {
            breakfast: ['Poha with peanuts', 'Upma with veggies', 'Idli with sambar', 'Paratha with curd'],
            lunch: ['Mixed veg sabzi with roti', 'Dal with rice', 'Paneer curry with roti', 'Chickpea curry with rice'],
            dinner: ['Vegetable khichdi', 'Dal with roti', 'Grilled paneer salad', 'Vegetable soup + bread'],
            snack: ['Fruit', 'Yogurt', 'Roasted chana']
        }
    };
    return lists[pref] || lists['Veg'];
}

function allocateCalories(budget) {
    // percent: breakfast 30%, lunch 35%, dinner 30%, snacks 5%
    return {
        breakfast: Math.round(budget * 0.30),
        lunch: Math.round(budget * 0.35),
        dinner: Math.round(budget * 0.30),
        snack: Math.round(budget * 0.05)
    };
}

export function generateDailyPlan(profile, budget) {
    const pref = profile?.diet_preference || 'Veg';
    const meals = pickMealsForPreference(pref);
    const cal = allocateCalories(budget);

    // simple rotation to make variety across days
    const day = {
        breakfast: { name: meals.breakfast[Math.floor(Math.random() * meals.breakfast.length)], calories: cal.breakfast },
        lunch: { name: meals.lunch[Math.floor(Math.random() * meals.lunch.length)], calories: cal.lunch },
        dinner: { name: meals.dinner[Math.floor(Math.random() * meals.dinner.length)], calories: cal.dinner },
        snack: { name: meals.snack[Math.floor(Math.random() * meals.snack.length)], calories: cal.snack }
    };
    return day;
}

export function generateWeeklyPlan(profile, budget, days = 7) {
    const plan = [];
    for (let i = 0; i < days; i++) {
        plan.push({ day: i + 1, date: null, meals: generateDailyPlan(profile, budget) });
    }
    return plan;
}

export function weeklyPlanToCsv(plan) {
    // CSV columns: Day,Meal,Description,Calories
    const rows = ['Day,Meal,Description,Calories'];
    plan.forEach(p => {
        rows.push(`${p.day},Breakfast,"${p.meals.breakfast.name}",${p.meals.breakfast.calories}`);
        rows.push(`${p.day},Lunch,"${p.meals.lunch.name}",${p.meals.lunch.calories}`);
        rows.push(`${p.day},Dinner,"${p.meals.dinner.name}",${p.meals.dinner.calories}`);
        rows.push(`${p.day},Snack,"${p.meals.snack.name}",${p.meals.snack.calories}`);
    });
    return rows.join('\n');
}

function calculateCalories() {
    let weight = document.getElementById('weight').value;
    let height = document.getElementById('height').value;
    let age = document.getElementById('age').value;
    let gender = document.getElementById('gender').value;
    let activity = document.getElementById('activity').value;

    if (!weight || !height || !age) {
        document.getElementById('result').innerText = "Please fill in all fields.";
        return;
    }

    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    let calories = bmr * activity;
    document.getElementById('result').innerText = `Daily Calories: ${Math.round(calories)} kcal`;
}

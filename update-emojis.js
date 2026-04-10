const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const emojiMap = {
    "Breakfast": "🥐",
    "Starters": "🥗",
    "Main Courses": "🍕",
    "Drinks": "🍹",
    "Extras": "🍟",
    "Desserts": "🍰"
};

if (Array.isArray(data.superCategories)) {
    data.superCategories.forEach(sc => {
        if (emojiMap[sc.name]) {
            sc.emoji = emojiMap[sc.name];
        }
    });
}

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log("Emojis updated successfully.");

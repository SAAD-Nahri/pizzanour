const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');
const rawData = fs.readFileSync(dataFile, 'utf8');
const data = JSON.parse(rawData);

const newItems = [
    // Salades
    { id: "sfd1", cat: "Salades", name: "Salade fruit", price: 30, desc: "" },
    { id: "sfd2", cat: "Salades", name: "Salade fruit avec rayeb", price: 30, desc: "" },
    { id: "sfd3", cat: "Salades", name: "Salade fruit orange", price: 30, desc: "" },
    { id: "sfd4", cat: "Salades", name: "Salade fruit au Choix", price: 35, desc: "" },

    // Tartes
    { id: "trt1", cat: "Tartes", name: "Tartes Citron", price: 15, desc: "" },
    { id: "trt2", cat: "Tartes", name: "Tarte Oreo", price: 12, desc: "" },
    { id: "trt3", cat: "Tartes", name: "Tarte Flan", price: 12, desc: "" },
    { id: "trt4", cat: "Tartes", name: "Tarte Chocolat", price: 12, desc: "" },
    { id: "trt5", cat: "Tartes", name: "Tarte Caramel", price: 12, desc: "" },

    // Rayeb
    { id: "ryb1", cat: "Rayeb", name: "Rayeb avec amande", price: 8, desc: "" },
    { id: "ryb2", cat: "Rayeb", name: "Rayeb normal", price: 8, desc: "" },
    { id: "ryb3", cat: "Rayeb", name: "Rayeb au ciron", price: 8, desc: "" },

    // Flan
    { id: "fln1", cat: "Flan", name: "Flan royal", price: 10, desc: "" },
    { id: "fln2", cat: "Flan", name: "Flan natias", price: 10, desc: "" },
    { id: "fln3", cat: "Flan", name: "Mhalabiya", price: 10, desc: "" },
    { id: "fln4", cat: "Flan", name: "Tiramisu", price: 15, desc: "" },
    { id: "fln5", cat: "Flan", name: "Pistachio", price: 20, desc: "" },

    // Boissons Chauds
    { id: "bc1", cat: "Boissons Chauds", name: "The verd", price: 10, desc: "" },
    { id: "bc2", cat: "Boissons Chauds", name: "The noir", price: 10, desc: "" },
    { id: "bc3", cat: "Boissons Chauds", name: "Cafe noir", price: 12, desc: "" },
    { id: "bc4", cat: "Boissons Chauds", name: "Cafe creme", price: 12, desc: "" },
    { id: "bc5", cat: "Boissons Chauds", name: "Nescafe", price: 10, desc: "" },
    { id: "bc6", cat: "Boissons Chauds", name: "Lait chaud", price: 6, desc: "" },
    { id: "bc7", cat: "Boissons Chauds", name: "The englaise", price: 10, desc: "" },
    { id: "bc8", cat: "Boissons Chauds", name: "Lait au siro", price: 5, desc: "" },
    { id: "bc9", cat: "Boissons Chauds", name: "Chocolat chaud", price: 10, desc: "" },

    // Boissons
    { id: "bsn1", cat: "Boissons", name: "Boisson", price: 10, desc: "" },
    { id: "bsn2", cat: "Boissons", name: "Boisson canette", price: 10, desc: "" },
    { id: "bsn3", cat: "Boissons", name: "Oulmes", price: 10, desc: "" },
    { id: "bsn4", cat: "Boissons", name: "Eau M", price: 5, desc: "" },
    { id: "bsn5", cat: "Boissons", name: "Eau G", price: 10, desc: "" },
    { id: "bsn6", cat: "Boissons", name: "Rani", price: 10, desc: "" },
    { id: "bsn7", cat: "Boissons", name: "Bio-Disfruta - B", price: 10, desc: "" },
    { id: "bsn8", cat: "Boissons", name: "Red bull", price: 20, desc: "" },
    { id: "bsn9", cat: "Boissons", name: "Enerji", price: 10, desc: "" },

    // Tajine
    { id: "taj1", cat: "Tajine", name: "Tajine Fruit de Mer", price: 60, desc: "" },
    { id: "taj2", cat: "Tajine", name: "Tajine Viande Hachee", price: 50, desc: "" },
    { id: "taj3", cat: "Tajine", name: "Tajine Poulet Champignons", price: 50, desc: "" },

    // Pahella
    { id: "pah1", cat: "Pahella", name: "Paella", price: 40, desc: "" },

    // Couscous
    { id: "csc1", cat: "Couscous", name: "couscous viande", price: 45, desc: "" },
    { id: "csc2", cat: "Couscous", name: "couscous poulet", price: 40, desc: "" },

    // Tacos
    { id: "tcs1", cat: "Tacos", name: "Tacos Poulet", price: 40, desc: "" },
    { id: "tcs2", cat: "Tacos", name: "Tacos Viande Hachée", price: 40, desc: "" },
    { id: "tcs3", cat: "Tacos", name: "Tacos Mixte", price: 45, desc: "" },
    { id: "tcs4", cat: "Tacos", name: "Tacos Fruit de Mer", price: 45, desc: "" },
    { id: "tcs5", cat: "Tacos", name: "Tacos Crevette", price: 45, desc: "" },
    { id: "tcs6", cat: "Tacos", name: "Tacos Viande", price: 45, desc: "" },
    { id: "tcs7", cat: "Tacos", name: "Tacos Thon", price: 40, desc: "" },

    // Mamburger
    { id: "brg1", cat: "Mamburger", name: "King Burger", price: 40, desc: "" },
    { id: "brg2", cat: "Mamburger", name: "King Chiken", price: 40, desc: "" },
    { id: "brg3", cat: "Mamburger", name: "Chiken Burger", price: 30, desc: "" },
    { id: "brg4", cat: "Mamburger", name: "Hamburger", price: 30, desc: "" },
    { id: "brg5", cat: "Mamburger", name: "Quality Burger", price: 30, desc: "" },
    { id: "brg6", cat: "Mamburger", name: "Cheese Burger", price: 30, desc: "" },
    { id: "brg7", cat: "Mamburger", name: "Egg Burger", price: 30, desc: "" },

    // Sandwich
    { id: "snd1", cat: "Sandwich", name: "Sandwich Thon", price: 20, desc: "" },
    { id: "snd2", cat: "Sandwich", name: "Sandwich Poulet", price: 30, desc: "" },
    { id: "snd3", cat: "Sandwich", name: "Sandwich Viande Hachée", price: 30, desc: "" },
    { id: "snd4", cat: "Sandwich", name: "Sandwich Viande", price: 40, desc: "" },
    { id: "snd5", cat: "Sandwich", name: "Sandwich Crevette", price: 35, desc: "" },
    { id: "snd6", cat: "Sandwich", name: "Sandwich Fruit de Mer", price: 35, desc: "" },
    { id: "snd7", cat: "Sandwich", name: "Sandwich Mixte", price: 35, desc: "" }
];

const newCatEmojis = {
    "Salades": "🥗",
    "Tartes": "🥧",
    "Rayeb": "🥛",
    "Flan": "🍮",
    "Boissons Chauds": "☕",
    "Boissons": "🥤",
    "Tajine": "🥘",
    "Pahella": "🥘",
    "Couscous": "🍲",
    "Tacos": "🌯",
    "Mamburger": "🍔",
    "Sandwich": "🥪"
};

// Merge items
data.menu.push(...newItems);

// Merge emojis
data.catEmojis = { ...data.catEmojis, ...newCatEmojis };

// Ensure proper super categories
const desserts = { name: "Desserts", cats: ["Salades", "Tartes", "Rayeb", "Flan"] };
const mainCoursesIndex = data.superCategories.findIndex(s => s.name === "Main Courses");
if (mainCoursesIndex !== -1) {
    data.superCategories[mainCoursesIndex].cats.push("Tajine", "Pahella", "Couscous", "Tacos", "Mamburger", "Sandwich");
} else {
    data.superCategories.push({ name: "Main Courses", cats: ["Tajine", "Pahella", "Couscous", "Tacos", "Mamburger", "Sandwich"] });
}

// Add Boissons Chauds and Boissons to Drinks super category
const drinksIndex = data.superCategories.findIndex(s => s.name === "Drinks");
if (drinksIndex !== -1) {
    data.superCategories[drinksIndex].cats.push("Boissons Chauds", "Boissons");
} else {
    data.superCategories.push({ name: "Drinks", cats: ["Boissons Chauds", "Boissons"] });
}
data.superCategories.push(desserts);

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log('Appended extra items');

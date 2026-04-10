const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');
const rawData = fs.readFileSync(dataFile, 'utf8');
const data = JSON.parse(rawData);

const menuItems = [
    // Entrées Froides
    { id: "e1", cat: "Entrées Froides", name: "Salade Nour", price: 40, desc: "" },
    { id: "e2", cat: "Entrées Froides", name: "Salade Noçoise", price: 30, desc: "" },
    { id: "e3", cat: "Entrées Froides", name: "Salade Rosa", price: 30, desc: "" },
    { id: "e4", cat: "Entrées Froides", name: "Salade Avocat Vinaigre", price: 40, desc: "" },
    { id: "e5", cat: "Entrées Froides", name: "Salade Royale", price: 40, desc: "" },
    { id: "e6", cat: "Entrées Froides", name: "Salade marocain", price: 30, desc: "" },
    { id: "e7", cat: "Entrées Froides", name: "Salade Avocat Aux Crevette", price: 45, desc: "" },
    { id: "e8", cat: "Entrées Froides", name: "Croquettes", price: 8, desc: "" },
    { id: "e9", cat: "Entrées Froides", name: "Portion frites", price: 10, desc: "" },
    { id: "e10", cat: "Entrées Froides", name: "Salad Chef", price: 50, desc: "" },

    // Entrées Chaudes
    { id: "ec1", cat: "Entrées Chaudes", name: "Soupe de Poisson", price: 20, desc: "" },
    { id: "ec2", cat: "Entrées Chaudes", name: "Soupe Spéciale", price: 30, desc: "" },
    { id: "ec3", cat: "Entrées Chaudes", name: "Omelette Crevettes", price: 40, desc: "" },
    { id: "ec4", cat: "Entrées Chaudes", name: "Omelette Champignon", price: 25, desc: "" },
    { id: "ec5", cat: "Entrées Chaudes", name: "Omelette Champignon Fromage", price: 30, desc: "" },
    { id: "ec6", cat: "Entrées Chaudes", name: "Tortella Naturelle", price: 30, desc: "" },
    { id: "ec7", cat: "Entrées Chaudes", name: "Tortella Crevette", price: 40, desc: "" },
    { id: "ec8", cat: "Entrées Chaudes", name: "Tortella Polet", price: 35, desc: "" },
    { id: "ec9", cat: "Entrées Chaudes", name: "Tortella thon", price: 35, desc: "" },
    { id: "ec10", cat: "Entrées Chaudes", name: "Soupa normal emport", price: 30, desc: "" },
    { id: "ec11", cat: "Entrées Chaudes", name: "Soupa special emport", price: 40, desc: "" },

    // Escalope
    { id: "esc1", cat: "Escalope", name: "Escalope Poulet Chaplure", price: 60, desc: "" },
    { id: "esc2", cat: "Escalope", name: "Escalope Poulet Grillée", price: 60, desc: "" },
    { id: "esc3", cat: "Escalope", name: "Escalope Poulet crème champignon", price: 60, desc: "" },
    { id: "esc4", cat: "Escalope", name: "Escalope Viande Grillé", price: 60, desc: "" },
    { id: "esc5", cat: "Escalope", name: "Escalope Viande crème champignon", price: 70, desc: "" },
    { id: "esc6", cat: "Escalope", name: "Escalope Viande Hachée", price: 50, desc: "" },
    { id: "esc7", cat: "Escalope", name: "strgnef", price: 65, desc: "" },
    { id: "esc8", cat: "Escalope", name: "Brochette Poulet", price: 50, desc: "" },
    { id: "esc9", cat: "Escalope", name: "Brochette Viande Hachée", price: 50, desc: "" },
    { id: "esc10", cat: "Escalope", name: "Brochette Viande", price: 60, desc: "" },
    { id: "esc11", cat: "Escalope", name: "Crevette Chaplure", price: 60, desc: "" },
    { id: "esc12", cat: "Escalope", name: "Calamar Chaplur", price: 60, desc: "" },
    { id: "esc13", cat: "Escalope", name: "Filet Spada", price: 70, desc: "" },
    { id: "esc14", cat: "Escalope", name: "Filet viande", price: 70, desc: "" },

    // Jus
    { id: "j1", cat: "Jus", name: "Jus mangue au lait et danone", price: 23, desc: "" },
    { id: "j2", cat: "Jus", name: "Jus citron et gingembre", price: 20, desc: "" },
    { id: "j3", cat: "Jus", name: "Jus orange et gingembre", price: 25, desc: "" },
    { id: "j4", cat: "Jus", name: "Jus ananas et kiwi et citron", price: 20, desc: "" },
    { id: "j5", cat: "Jus", name: "Jus avocat citron", price: 20, desc: "" },
    { id: "j6", cat: "Jus", name: "Jus melon et ananas et citron", price: 20, desc: "" },
    { id: "j7", cat: "Jus", name: "Jus banane et framboise etcitron", price: 22, desc: "" },
    { id: "j8", cat: "Jus", name: "Jus banane et kiwi et citron", price: 20, desc: "" },
    { id: "j9", cat: "Jus", name: "Jus d Anaas + ORANGE", price: 20, desc: "" },
    { id: "j10", cat: "Jus", name: "Jus Prune", price: 18, desc: "" },
    { id: "j11", cat: "Jus", name: "Jus La pêche", price: 18, desc: "" },
    { id: "j12", cat: "Jus", name: "Jus Kiwi", price: 20, desc: "" },
    { id: "j13", cat: "Jus", name: "Jus Papay", price: 18, desc: "" },
    { id: "j14", cat: "Jus", name: "Jus Kaki", price: 18, desc: "" },
    { id: "j15", cat: "Jus", name: "Jus mojito", price: 20, desc: "" },
    { id: "jp1", cat: "Jus", name: "Carotte", price: 20, desc: "" },
    { id: "jp2", cat: "Jus", name: "Raisins", price: 25, desc: "" },
    { id: "jp3", cat: "Jus", name: "Mix 2", price: 30, desc: "" },
    { id: "jp4", cat: "Jus", name: "Mix 3", price: 35, desc: "" },
    { id: "jp5", cat: "Jus", name: "Grenade", price: 25, desc: "" },
    { id: "jp6", cat: "Jus", name: "Cerise", price: 45, desc: "" },
    { id: "jp7", cat: "Jus", name: "Ananas", price: 45, desc: "" },
    { id: "jp8", cat: "Jus", name: "Pomme", price: 25, desc: "" },
    { id: "jp9", cat: "Jus", name: "Melon vert", price: 20, desc: "" },
    { id: "jp10", cat: "Jus", name: "Pomme vert régime", price: 30, desc: "" },
    { id: "jp11", cat: "Jus", name: "Melon jaune", price: 20, desc: "" },
    { id: "jp12", cat: "Jus", name: "Poire", price: 25, desc: "" },
    { id: "jm1", cat: "Jus", name: "Jus orange + emporte", price: 15, desc: "" },
    { id: "jm2", cat: "Jus", name: "Jus citron + emporte", price: 10, desc: "" },
    { id: "jm3", cat: "Jus", name: "Jus avocat + Danino", price: 20, desc: "" },
    { id: "jm4", cat: "Jus", name: "Jus pompe", price: 18, desc: "" },
    { id: "jm5", cat: "Jus", name: "Jus spécial", price: 20, desc: "" },
    { id: "jm6", cat: "Jus", name: "Jus fraise", price: 20, desc: "" },
    { id: "jm7", cat: "Jus", name: "Jus royal", price: 20, desc: "" },
    { id: "jm8", cat: "Jus", name: "Jus banane", price: 18, desc: "" },
    { id: "jm9", cat: "Jus", name: "Jus avocat avec fruits sec", price: 30, desc: "" },
    { id: "jm10", cat: "Jus", name: "Jus avocat avec amande", price: 25, desc: "" },
    { id: "jm11", cat: "Jus", name: "Jus avocat et banane", price: 20, desc: "" },
    { id: "jm12", cat: "Jus", name: "Jus panaché au lait", price: 20, desc: "" },
    { id: "jm13", cat: "Jus", name: "Jus mangue et orange", price: 20, desc: "" },
    { id: "jm14", cat: "Jus", name: "Jus mangue au lait", price: 20, desc: "" },
    { id: "jm15", cat: "Jus", name: "Jus fruits rouge et raisin avec l'eau", price: 33, desc: "" },
    { id: "jm16", cat: "Jus", name: "Jus fruits passions", price: 35, desc: "" },
    { id: "jm17", cat: "Jus", name: "Jus chirimoya + Danino", price: 30, desc: "" },
    { id: "jm18", cat: "Jus", name: "Jus dragon + Danino", price: 30, desc: "" },

    // Petit Déjeuner
    { id: "pd1", cat: "Petit Déjeuner", name: "Petit Déjeuner Chamali", price: 35, desc: "2 Oeufs, Salad, Jus Chiya, Fromage Baldi, La Dinde, La Vache kiri, Boisson Chaud, Eaux Minerale" },
    { id: "pd2", cat: "Petit Déjeuner", name: "Petit Déjeuner Espagnole", price: 35, desc: "Pain grillé, Purée de tomate, Huile d'olive et Fromage Manchego, Ail, Origon, Boisson chaude , Jus, Eaux minerale" },
    { id: "pd3", cat: "Petit Déjeuner", name: "Petit Déjeuner Turque", price: 40, desc: "Salami, 2 oeufs Brouillés, Concombre, tomate, Beurre Boisson chaude, Jus, Eau Minerale" },
    { id: "pd4", cat: "Petit Déjeuner", name: "Petit Déjeune Catalan", price: 40, desc: "Pain spécial, Thon, Avocat, Tomate Purée, Fromage Manchego, Jus, Boisson chaud, Eau Minerale" },
    { id: "pd5", cat: "Petit Déjeuner", name: "Petit Déjaune Marocain", price: 35, desc: "Pain grillé, Harcha et Baghrir, Rghayef Fromage Baldi, Miel, Amlou Beurre, Confiture, Datte, Oeuf Dure, Jus, Boisson Chaud, Eau Minerale" },
    { id: "pd6", cat: "Petit Déjeuner", name: "Potit Déjeuner Amsterdam", price: 35, desc: "Toast au Esreales, 2 Oeufs Filet Dinde Fumee, Fromage Rouge. Boisson Chaude, Jus, Eau Minerale" },
    { id: "pd7", cat: "Petit Déjeuner", name: "Petit Déjeune Fassi", price: 40, desc: "2 oeufs Khlie, Pain Complet, Jben Arabi, Huile d'olive, Olive Noir, Boisson Chaude Jus, Eau Minerale" },
    { id: "pd8", cat: "Petit Déjeuner", name: "Petit Déjeune Ayour", price: 60, desc: "Oeuf, Viennoiserie, Toaste, Avocat, Pain, Fromage, Jben Arabi, Beurre Mini Crepe Miel, Amlou, Datte Yaourt, Boissons Chaudes, Jus d'Orange, Eau Minérale" },

    // Pizza
    { id: "pz1", cat: "Pizza", name: "Pizza Margarita", price: 35, desc: "Sauce tomate, mozarella, fromage rouge, olives noires, origan" },
    { id: "pz2", cat: "Pizza", name: "Pizza Bolognaise", price: 40, desc: "Sauce tomate, mozarella, fromage rouge, viande hachée, origan" },
    { id: "pz3", cat: "Pizza", name: "Pizza Demi Demi", price: 48, desc: "Demi bolognaise, demi fruit de mer, mozarella, Sauce tomate, origan, fromage rouge, champignon, calamar, gamba, olives" },
    { id: "pz4", cat: "Pizza", name: "Pizza Végétarienne", price: 40, desc: "Sauce tomate, mozarella, oignons fromage, les trois poivrons, champignon, asperges, olives noires, origan" },
    { id: "pz5", cat: "Pizza", name: "Pizza 4 Saisons", price: 50, desc: "Sauce tomate, fromage, viande hachée, saucisses, poulet, crevettes, champignon, olives, origan" },
    { id: "pz6", cat: "Pizza", name: "Pizza Thon", price: 40, desc: "Sauce tomate, mozarella, fromage rouge, champignon, thon, olives noires, origan" },
    { id: "pz7", cat: "Pizza", name: "Pizza Poulet", price: 40, desc: "Sauce tomate, mozarella, fromage, champignon, poulet, olives noir, origan" },
    { id: "pz8", cat: "Pizza", name: "Pizza Fruit de mer", price: 48, desc: "Sauce tomate, mozarella, fromage rouge, crevettes, calamars, champignon, olives noires, origan" },
    { id: "pz9", cat: "Pizza", name: "Pizza Nour", price: 65, desc: "Sauce tomate, fromage, calamars, viande hachee, poulet, crevette, champignon, saucisses, ananas, olives, origan" },
    { id: "pz10", cat: "Pizza", name: "Pizza Coupole", price: 40, desc: "Sauce tomate, fromage, olives champignon, saucisses, origan" },
    { id: "pz11", cat: "Pizza", name: "Pizza Royale", price: 60, desc: "Sauce tomate, fromage, viande hachee, Saucisses, poulet, crevette, champignon, olives, origan" },
    { id: "pz12", cat: "Pizza", name: "Pizza Milano", price: 40, desc: "Sauce tomate, fromage, champignon, olives, origan" },
    { id: "pz13", cat: "Pizza", name: "Pizza Spéciale2", price: 50, desc: "" },

    // Les Pates
    { id: "pt1", cat: "Les Pates", name: "Lasagne Poulet", price: 45, desc: "" },
    { id: "pt2", cat: "Les Pates", name: "Lasagne Bolognaise", price: 45, desc: "" },
    { id: "pt3", cat: "Les Pates", name: "Lasagne Fruits de Mer", price: 50, desc: "" },

    // Spaghetti
    { id: "sp1", cat: "Spaghetti", name: "Spaghetti Fruits de Mer", price: 50, desc: "" },
    { id: "sp2", cat: "Spaghetti", name: "Spaghetti Bolognaise", price: 45, desc: "" },
    { id: "sp3", cat: "Spaghetti", name: "Spaghetti Poulet", price: 45, desc: "" },
    { id: "sp4", cat: "Spaghetti", name: "Spaghetti Thon", price: 50, desc: "" },

    // Panini
    { id: "pn1", cat: "Panini", name: "Panini Poulet", price: 30, desc: "" },
    { id: "pn2", cat: "Panini", name: "Panini Viande Hachée", price: 30, desc: "" },
    { id: "pn3", cat: "Panini", name: "Panini Hot Dog", price: 30, desc: "" },
    { id: "pn4", cat: "Panini", name: "Panini Thon", price: 30, desc: "" },
    { id: "pn5", cat: "Panini", name: "Panini Viande", price: 40, desc: "" },
    { id: "pn6", cat: "Panini", name: "Panini Fromage", price: 25, desc: "" },
    { id: "pn7", cat: "Panini", name: "Panini Crevette", price: 40, desc: "" },
    { id: "pn8", cat: "Panini", name: "Panini Fruit de Mer", price: 40, desc: "" },
    { id: "pn9", cat: "Panini", name: "Panini Mixte", price: 40, desc: "" },

    // Extras
    { id: "ex1", cat: "Extras", name: "Sauce Algerian", price: 5, desc: "" },
    { id: "ex2", cat: "Extras", name: "Sauce Andalous", price: 5, desc: "" },
    { id: "ex3", cat: "Extras", name: "Sauce Mayonnaise", price: 5, desc: "" }
];

data.menu = menuItems;

data.catEmojis = {
    "Petit Déjeuner": "🥐",
    "Entrées Froides": "🥗",
    "Entrées Chaudes": "🍲",
    "Escalope": "🥩",
    "Jus": "🧃",
    "Pizza": "🍕",
    "Les Pates": "🍝",
    "Spaghetti": "🍝",
    "Panini": "🥪",
    "Extras": "🍟"
};

data.superCategories = [
    {
        name: "Breakfast",
        cats: ["Petit Déjeuner"]
    },
    {
        name: "Starters",
        cats: ["Entrées Froides", "Entrées Chaudes"]
    },
    {
        name: "Main Courses",
        cats: ["Pizza", "Escalope", "Les Pates", "Spaghetti", "Panini"]
    },
    {
        name: "Drinks",
        cats: ["Jus"]
    },
    {
        name: "Extras",
        cats: ["Extras"]
    }
];

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log('Menu successfully injected.');

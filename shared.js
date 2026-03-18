/**
 * Shared Data and Utilities for Foody
 * Loaded before app.js and menu.js
 */

window.defaultMenu = [
    // --- PETIT DÉJEUNER ---
    { "id": 99, "cat": "Petit Déjeuner", "name": "Chamali", "desc": "Soupe du jour, confiture, olive noire, 2 oeufs au plats, Jben arabi, fromage rouge, dinde fumée, jus, boisson chaude au choix, eau minérale", "price": 30, "featured": true, "img": "images/hero_burger.png", "ingredients": ["Soupe du jour", "Confiture", "Olive noire", "2 Oeufs au plats", "Jben arabi", "Fromage rouge", "Dinde fumée", "Jus d'orange", "Boisson chaude au choix", "Eau minérale"] },
    { "id": 100, "cat": "Petit Déjeuner", "name": "Continental", "desc": "Soupe du jour, omelette, fromage charcuterie, confiture, huile d'olive, olive noire, jus, boisson chaude au choix, eau minérale", "price": 30, "img": "images/bg_tasty.png", "ingredients": ["Soupe du jour", "Omelette", "Fromage charcuterie", "Confiture", "Huile d'olive", "Olive noire", "Jus d'orange", "Boisson chaude au choix", "Eau minérale"] },
    { "id": 101, "cat": "Petit Déjeuner", "name": "Fassi", "desc": "Soupe du jour, oeufs au Khli, pain complet, huile d'olive, olive noire, jus, boisson chaude au choix, eau minérale", "price": 40, "img": "images/hero_burger.png", "ingredients": ["Soupe du jour", "Oeufs au Khli", "Pain complet", "Huile d'olive", "Olive noire", "Jus d'orange", "Boisson chaude au choix", "Eau minérale"] },
    { "id": 102, "cat": "Petit Déjeuner", "name": "Marocain", "desc": "Soupe du jour, 2 Msaman, 2 Harcha, huile d'olive, confiture, olive noire, jus, boisson chaude au choix, eau minérale", "price": 30, "img": "images/bg_tasty.png", "ingredients": ["Soupe du jour", "2 Msaman", "2 Harcha", "Huile d'olive", "Confiture", "Olive noire", "Jus d'orange", "Boisson chaude au choix", "Eau minérale"] },
    { "id": 103, "cat": "Petit Déjeuner", "name": "Hollandaise", "desc": "Soupe du jour, toaste, dinde fumée, fromage, oeuf au plat, jus, boisson chaude au choix, eau minérale", "price": 45, "featured": true, "img": "images/hero_burger.png", "ingredients": ["Soupe du jour", "Toaste", "Dinde fumée", "Fromage", "Oeuf au plat", "Jus d'orange", "Boisson chaude au choix", "Eau minérale"] },

    // --- SALADES ---
    { "id": 42, "cat": "Les Salades", "name": "Salade Marocaine", "desc": "Tomate, concombre, oignon, laitue, poivron, thon", "price": 25, "img": "images/bg_tasty.png", "ingredients": ["Tomate", "Concombre", "Oignon", "Laitue", "Poivron", "Thon"] },
    { "id": 43, "cat": "Les Salades", "name": "Salade Niçoise", "desc": "Pomme de terre, carotte, betterave, concombre, tomate, riz, thon, œuf dur, sauce cocktail", "price": 35, "img": "images/hero_burger.png", "ingredients": ["Pomme de terre", "Carotte", "Betterave", "Concombre", "Tomate", "Riz", "Thon", "Œuf dur", "Sauce cocktail"] },
    { "id": 44, "cat": "Les Salades", "name": "Salade Cesar", "desc": "Poulet, tomate cerise, croutons, fromage parmesan, l'anchois, laitue, sauce césar", "price": 45, "featured": true, "img": "images/bg_tasty.png", "ingredients": ["Poulet", "Tomate cerise", "Croutons", "Fromage parmesan", "Anchois", "Laitue", "Sauce césar"] },
    { "id": 45, "cat": "Les Salades", "name": "Salade Royal Nolasco", "desc": "Laitue, avocat, crevette, calamar, tomate cerise, surimi, anchois, thon, ananas, parmesan, sauce pesto", "price": 80, "featured": true, "img": "images/hero_burger.png", "ingredients": ["Laitue", "Avocat", "Crevette", "Calamar", "Tomate cerise", "Surimi", "Anchois", "Thon", "Ananas", "Fromage parmesan", "Sauce Pesto"] },

    // --- CUISINE & SAVEURS ---
    { "id": 1, "cat": "Les Pâtes", "name": "Pâtes sauce bolognaise", "desc": "Spaghetti, Penné ou Tagliatelle", "price": 40, "img": "images/bg_tasty.png", "ingredients": [] },
    { "id": 2, "cat": "Les Pâtes", "name": "Pâtes fruits de mer sauce blanche", "desc": "Spaghetti, Penné ou Tagliatelle", "price": 50, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 3, "cat": "Les Pâtes", "name": "Pâtes poulet sauce champignon", "desc": "Spaghetti, Penné ou Tagliatelle", "price": 40, "img": "images/bg_tasty.png", "ingredients": [] },
    { "id": 4, "cat": "Les Pâtes", "name": "Pâtes carbonara", "desc": "Spaghetti, Penné ou Tagliatelle", "price": 40, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 5, "cat": "Les Pâtes", "name": "Pâtes poulet pesto", "desc": "Spaghetti, Penné ou Tagliatelle", "price": 45, "img": "images/bg_tasty.png", "ingredients": [] },

    { "id": 6, "cat": "Pasticcio", "name": "Pasticcio poulet", "desc": "Gratin de pâtes au poulet et fromage", "price": 35, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 7, "cat": "Pasticcio", "name": "Pasticcio dinde fumée", "desc": "Gratin de pâtes à la dinde fumée", "price": 35, "img": "images/bg_tasty.png", "ingredients": [] },
    { "id": 8, "cat": "Pasticcio", "name": "Pasticcio mixte", "desc": "Mélange gourmand de viandes", "price": 45, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 9, "cat": "Pasticcio", "name": "Pasticcio fruits de mer", "desc": "Gratin aux fruits de mer frais", "price": 50, "img": "images/bg_tasty.png", "ingredients": [] },
    { "id": 10, "cat": "Pasticcio", "name": "Pasticcio viande hachée", "desc": "Gratin à la viande hachée savoureuse", "price": 40, "img": "images/hero_burger.png", "ingredients": [] },

    { "id": 11, "cat": "Les Plats", "name": "Émincé Poulet au Champignon", "desc": "Garniture: Riz mariné, Pomme frite, Légumes sautés ou Penne", "price": 70, "img": "images/bg_tasty.png", "ingredients": [] },
    { "id": 12, "cat": "Les Plats", "name": "Cordon Bleu", "desc": "Garniture: Riz mariné, Pomme frite, Légumes sautés ou Penne", "price": 75, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 13, "cat": "Les Plats", "name": "Chicken Panée", "desc": "Garniture: Riz mariné, Pomme frite, Légumes sautés ou Penne", "price": 75, "img": "images/bg_tasty.png", "ingredients": [] },
    { "id": 14, "cat": "Les Plats", "name": "Brochette de poulet", "desc": "Garniture: Riz mariné, Pomme frite, Légumes sautés ou Penne", "price": 55, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 15, "cat": "Les Plats", "name": "Brochette Mixte", "desc": "Garniture: Riz mariné, Pomme frite, Légumes sautés ou Penne", "price": 70, "img": "images/bg_tasty.png", "ingredients": [] },

    { "id": 16, "cat": "Tajine", "name": "Crevette Pilpil", "desc": "Tajine traditionnel aux crevettes épicées", "price": 60, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 17, "cat": "Tajine", "name": "Tajin Viande hachée", "desc": "Tajine à la viande hachée et œufs", "price": 50, "img": "images/bg_tasty.png", "ingredients": [] },

    // --- PIZZAS ---
    { "id": 46, "cat": "Pizzas", "name": "Pizza Margarita", "desc": "Sauce tomate, fromage mozzarella, olive noire, origan", "price": 35, "img": "images/hero_burger.png", "ingredients": ["Sauce tomate", "Mozzarella", "Olive noire", "Origan"] },
    { "id": 47, "cat": "Pizzas", "name": "Pizza Viande Hachée", "desc": "Sauce tomate, fromage mozzarella, viande hachée, champignons, olive noire, origan", "price": 55, "img": "images/bg_tasty.png", "ingredients": ["Sauce tomate", "Mozzarella", "Viande hachée", "Champignons", "Olive noire", "Origan"] },
    { "id": 48, "cat": "Pizzas", "name": "Pizza Poulet", "desc": "Sauce tomate, fromage mozzarella, poulet, poivron, olive noire, origan", "price": 40, "featured": true, "img": "images/hero_burger.png", "ingredients": ["Sauce tomate", "Mozzarella", "Poulet", "Poivron", "Olive noire", "Origan"] },
    { "id": 49, "cat": "Pizzas", "name": "Pizza Thon", "desc": "Sauce tomate, fromage mozzarella, thon, oignon, olive noire, origan", "price": 40, "img": "images/bg_tasty.png", "ingredients": ["Sauce tomate", "Mozzarella", "Thon", "Oignon", "Olive noire", "Origan"] },
    { "id": 50, "cat": "Pizzas", "name": "Pizza Poulet Pesto", "desc": "Sauce pesto, fromage mozzarella, poulet, champignons, olive noire, origan", "price": 45, "featured": true, "img": "images/hero_burger.png", "ingredients": ["Sauce pesto", "Mozzarella", "Poulet", "Champignons", "Olive noire", "Origan"] },
    { "id": 51, "cat": "Pizzas", "name": "Pizza Fruits De Mer", "desc": "Sauce tomate, fromage mozzarella, crevettes, calamar, champignons, origan", "price": 60, "img": "images/bg_tasty.png", "ingredients": ["Sauce tomate", "Mozzarella", "Crevettes", "Calamar", "Champignons", "Origan"] },
    { "id": 52, "cat": "Pizzas", "name": "Pizza 4 Saisons", "desc": "Sauce tomate, fromage mozzarella, poulet, viande hachée, thon, crevettes, champignons, origan", "price": 50, "img": "images/hero_burger.png", "ingredients": ["Sauce tomate", "Mozzarella", "Poulet", "Viande hachée", "Thon", "Crevettes", "Champignons", "Origan"] },
    { "id": 53, "cat": "Pizzas", "name": "Pizza Nolasco", "desc": "Crème fraîche, fromage mozzarella, viande hachée, crevette, calamar, surimi, olive noire, champignons, origan", "price": 70, "featured": true, "img": "images/bg_tasty.png", "ingredients": ["Crème fraîche", "Mozzarella", "Viande hachée", "Crevette", "Calamar", "Surimi", "Olive noire", "Champignons", "Origan"] },
    { "id": 54, "cat": "Pizzas", "name": "Calzone", "desc": "Sauce tomate, fromage mozzarella, dinde fumée, poulet, champignons, olive noire", "price": 45, "img": "images/hero_burger.png", "ingredients": ["Sauce tomate", "Mozzarella", "Dinde fumée", "Poulet", "Champignons", "Olive noire"] },

    // --- FAST FOOD ---
    { "id": 18, "cat": "Burger", "name": "Hamburger", "desc": "Classique et savoureux", "price": 40, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 19, "cat": "Burger", "name": "Cheese Burger", "desc": "Avec fromage fondant", "price": 35, "img": "images/bg_tasty.png", "ingredients": [] },
    { "id": 20, "cat": "Burger", "name": "Chicken Burger", "desc": "Poulet croustillant", "price": 35, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 21, "cat": "Burger", "name": "Double Burger", "desc": "Deux fois plus de plaisir", "price": 50, "featured": true, "img": "images/bg_tasty.png", "ingredients": [] },
    { "id": 22, "cat": "Burger", "name": "Double Chicken", "desc": "Double poulet croustillant", "price": 55, "img": "images/hero_burger.png", "ingredients": [] },
    { "id": 23, "cat": "Burger", "name": "American Burger", "desc": "Style USA généreux", "price": 60, "featured": true, "img": "images/bg_tasty.png", "ingredients": [] },
    { "id": 24, "cat": "Burger", "name": "Nolasco Burger", "desc": "La spécialité de la maison", "price": 70, "featured": true, "img": "images/hero_burger.png", "ingredients": [] },

    { "id": 25, "cat": "Burritos", "name": "Burritos Steak Poulet", "desc": "Tomate, Laitue, Fromage, Dinde, Maïs, Avocat", "price": 45, "images": [], "ingredients": [] },
    { "id": 26, "cat": "Burritos", "name": "Burritos Viande Hachée", "desc": "Tomate, Laitue, Fromage, Dinde, Maïs, Avocat", "price": 50, "images": [], "ingredients": [] },
    { "id": 27, "cat": "Burritos", "name": "Burritos Chicken Panée", "desc": "Tomate, Laitue, Fromage, Dinde, Maïs, Avocat", "price": 50, "images": [], "ingredients": [] },
    { "id": 28, "cat": "Burritos", "name": "Burritos Fruits De Mer", "desc": "Tomate, Laitue, Fromage, Dinde, Maïs, Avocat", "price": 65, "images": [], "ingredients": [] },
    { "id": 29, "cat": "Burritos", "name": "Burritos Nuggets", "desc": "Tomate, Laitue, Fromage, Dinde, Maïs, Avocat", "price": 45, "images": [], "ingredients": [] },
    { "id": 30, "cat": "Burritos", "name": "Burritos Nolasco", "desc": "Tomate, Laitue, Fromage, Dinde, Maïs, Avocat", "price": 70, "images": [], "ingredients": [] },

    { "id": 31, "cat": "Crêpes Salées", "name": "Crêpe Poulet Champignon", "desc": "Garniture riche et crémeuse", "price": 40, "images": [], "ingredients": [] },
    { "id": 32, "cat": "Crêpes Salées", "name": "Crêpe Fruits De Mer", "desc": "Mélange de la mer frais", "price": 50, "images": [], "ingredients": [] },
    { "id": 33, "cat": "Crêpes Salées", "name": "Crêpe Dinde Fumée", "desc": "Légère et savoureuse", "price": 35, "images": [], "ingredients": [] },
    { "id": 34, "cat": "Crêpes Salées", "name": "Crêpe Viande Hachée", "desc": "Généreuse en viande", "price": 45, "images": [], "ingredients": [] },
    { "id": 35, "cat": "Crêpes Salées", "name": "Crêpe Salé Royal Nolasco", "desc": "L'expérience royale salée", "price": 70, "images": [], "ingredients": [] },

    // --- SANDWICHES & TACOS ---
    { "id": 55, "cat": "Sandwich", "name": "Sandwich Steak Poulet", "desc": "Laitue, Tomate, Cheddar, Steak Poulet, Sauce cocktail", "price": 35, "images": [], "ingredients": [] },
    { "id": 56, "cat": "Sandwich", "name": "Sandwich American", "desc": "Oignon Caramelisé, Viande Hachée, Fromage, Dinde Fumée", "price": 40, "images": [], "ingredients": [] },
    { "id": 57, "cat": "Sandwich", "name": "Sandwich Chicken Pané", "desc": "Laitue, Tomate, Fromage, Chicken Pané, Sauce Cocktail", "price": 40, "images": [], "ingredients": [] },
    { "id": 58, "cat": "Sandwich", "name": "Sandwich Fruits De Mer", "desc": "Laitue, Tomate, Fromage, Crevette, Calamar, Sauce Cocktail", "price": 50, "images": [], "ingredients": [] },
    { "id": 59, "cat": "Sandwich", "name": "Sandwich Thon", "desc": "Laitue, Tomate, Fromage, Thon, Oignon, Sauce Cocktail", "price": 30, "images": [], "ingredients": [] },

    { "id": 60, "cat": "Tacos", "name": "Tacos Poulet", "desc": "Sauce au choix: Algérienne, Andalouse, Bigup, Samurai", "price": 40, "images": [], "ingredients": [] },
    { "id": 61, "cat": "Tacos", "name": "Tacos Viande Haché", "desc": "Sauce au choix: Algérienne, Andalouse, Bigup, Samurai", "price": 45, "images": [], "ingredients": [] },
    { "id": 62, "cat": "Tacos", "name": "Tacos Nugget", "desc": "Sauce au choix: Algérienne, Andalouse, Bigup, Samurai", "price": 40, "images": [], "ingredients": [] },
    { "id": 63, "cat": "Tacos", "name": "Tacos Cordon Bleu", "desc": "Sauce au choix: Algérienne, Andalouse, Bigup, Samurai", "price": 45, "images": [], "ingredients": [] },
    { "id": 64, "cat": "Tacos", "name": "Tacos Fruits De Mer", "desc": "Sauce au choix: Algérienne, Andalouse, Bigup, Samurai", "price": 55, "images": [], "ingredients": [] },
    { "id": 65, "cat": "Tacos", "name": "Tacos Chicken pané", "desc": "Sauce au choix: Algérienne, Andalouse, Bigup, Samurai", "price": 45, "images": [], "ingredients": [] },
    { "id": 66, "cat": "Tacos", "name": "Tacos Nolasco", "desc": "Sauce au choix: Algérienne, Andalouse, Bigup, Samurai", "price": 60, "images": [], "ingredients": [] },
    { "id": 67, "cat": "Tacos", "name": "Gratiné fromage cheddar", "desc": "Supplément délicieux", "price": 5, "images": [], "ingredients": [] },

    { "id": 68, "cat": "Panini", "name": "Panini Thon", "desc": "Classique et croustillant", "price": 30, "images": [], "ingredients": [] },
    { "id": 69, "cat": "Panini", "name": "Panini Poulet", "desc": "Poulet fondant", "price": 30, "images": [], "ingredients": [] },
    { "id": 70, "cat": "Panini", "name": "Panini Viande Hachée", "desc": "Savoureux et chaud", "price": 35, "price": 35, "images": [], "ingredients": [] },
    { "id": 71, "cat": "Panini", "name": "Panini Fruit De Mer", "desc": "Délices de la mer", "price": 50, "images": [], "ingredients": [] },
    { "id": 72, "cat": "Panini", "name": "Panini Mixte", "desc": "Le meilleur des deux mondes", "price": 45, "images": [], "ingredients": [] },

    // --- PAUSE CAFÉ & DRINKS ---
    { "id": 104, "cat": "Nos Cafés", "name": "Expresso", "desc": "Café italien noir intenso", "price": 14, "images": [], "ingredients": ["Café noir"] },
    { "id": 105, "cat": "Nos Cafés", "name": "Double expresso", "desc": "Double dose de café italien", "price": 18, "images": [], "ingredients": ["Café noir double"] },
    { "id": 106, "cat": "Nos Cafés", "name": "Café au Lait", "desc": "Équilibré et crémeux", "price": 14, "images": [], "ingredients": ["Café", "Lait"] },
    { "id": 107, "cat": "Nos Cafés", "name": "Café Allongé Américain", "desc": "Plus long, plus léger", "price": 14, "images": [], "ingredients": ["Café", "Eau"] },
    { "id": 108, "cat": "Nos Cafés", "name": "Nescafé", "desc": "Instantané classique", "price": 12, "images": [], "ingredients": ["Nescafé"] },
    { "id": 109, "cat": "Nos Cafés", "name": "Café diablo + Crème Chantilly", "desc": "Café au lait avec le meilleur goût du chocolat fondu", "price": 28, "images": [], "ingredients": ["Café", "Lait", "Chocolat fondu", "Crème chantilly"] },
    { "id": 110, "cat": "Nos Cafés", "name": "Cappuccino italiane", "desc": "Café au lait avec une onctueuse crème chantilly garnie au sirop du chocolat", "price": 28, "images": [], "ingredients": ["Café", "Lait", "Crème chantilly", "Sirop chocolat"] },
    { "id": 111, "cat": "Nos Cafés", "name": "Iced Coffee", "desc": "Café glacé rafraîchissant", "price": 23, "images": [], "ingredients": ["Café", "Glaçons", "Lait"] },
    { "id": 112, "cat": "Nos Cafés", "name": "Café aromatisé", "desc": "Café aux saveurs subtiles", "price": 17, "images": [], "ingredients": ["Café", "Arôme au choix"] },

    { "id": 113, "cat": "Lait", "name": "Lait Chaud", "desc": "Pur et réconfortant", "price": 12, "images": [], "ingredients": ["Lait chaud"] },
    { "id": 114, "cat": "Lait", "name": "Lait Froid", "desc": "Frais et nutritif", "price": 12, "images": [], "ingredients": ["Lait froid"] },
    { "id": 115, "cat": "Lait", "name": "Verveine au lait", "desc": "Infusion relaxante de verveine au lait", "price": 12, "images": [], "ingredients": ["Verveine", "Lait"] },
    { "id": 116, "cat": "Lait", "name": "Lait au Sirop", "desc": "Lait sucré et coloré au sirop", "price": 12, "images": [], "ingredients": ["Lait", "Sirop"] },
    { "id": 117, "cat": "Lait", "name": "Lait au Chocolat", "desc": "Le favori des petits et grands", "price": 12, "images": [], "ingredients": ["Lait", "Chocolat"] },
    { "id": 118, "cat": "Lait", "name": "Chocolat Fondu", "desc": "Chocolat riche et onctueux", "price": 25, "images": [], "ingredients": ["Chocolat fondu"] },

    { "id": 119, "cat": "Thé et Infusion", "name": "Thé à la Menthe", "desc": "Thé à la menthe traditionnel marocain", "price": 12, "images": [], "ingredients": ["Thé", "Menthe fraîche", "Sucre"] },
    { "id": 120, "cat": "Thé et Infusion", "name": "Thé aux Herbes Aromatiques", "desc": "Mélange d'herbes digestives et parfumées", "price": 12, "images": [], "ingredients": ["Thé", "Herbes aromatiques"] },
    { "id": 121, "cat": "Thé et Infusion", "name": "Verveine au Thé", "desc": "Mélange relaxant de thé et verveine", "price": 12, "images": [], "ingredients": ["Thé", "Verveine"] },
    { "id": 122, "cat": "Thé et Infusion", "name": "Thé au Chiba", "desc": "Thé traditionnel d'hiver à l'absinthe", "price": 12, "images": [], "ingredients": ["Thé", "Chiba (Absinthe)"] },
    { "id": 123, "cat": "Thé et Infusion", "name": "Verveine à l'eau", "desc": "Infusion pure de verveine", "price": 12, "images": [], "ingredients": ["Verveine", "Eau"] },

    { "id": 124, "cat": "Boissons", "name": "L'eau 50cl", "desc": "Eau minérale", "price": 8, "images": [], "ingredients": [] },
    { "id": 125, "cat": "Boissons", "name": "Boisson Gazeuse Canette Maxi", "desc": "Soda au choix", "price": 14, "images": [], "ingredients": [] },
    { "id": 126, "cat": "Boissons", "name": "Energie", "desc": "Boisson énergisante", "price": 20, "images": [], "ingredients": [] },
    { "id": 127, "cat": "Boissons", "name": "Redbull", "desc": "Original Energy Drink", "price": 35, "images": [], "ingredients": [] },
    { "id": 128, "cat": "Boissons", "name": "Jus conservé", "desc": "Jus en bouteille", "price": 27, "images": [], "ingredients": [] },
    { "id": 129, "cat": "Boissons", "name": "Oulmes", "desc": "Eau gazeuse marocaine", "price": 12, "images": [], "ingredients": [] },

    { "id": 73, "cat": "Nos Jus", "name": "Jus d'Orange", "desc": "Orange fraîche pressée", "price": 16, "images": [], "ingredients": ["Orange fraîche"] },
    { "id": 74, "cat": "Nos Jus", "name": "Jus de Banane", "desc": "Banane onctueuse", "price": 16, "images": [], "ingredients": ["Banane"] },
    { "id": 75, "cat": "Nos Jus", "name": "Jus de Pomme", "desc": "Pomme douce et fraîche", "price": 16, "images": [], "ingredients": ["Pomme"] },
    { "id": 76, "cat": "Nos Jus", "name": "Jus d'Ananas", "desc": "Ananas exotique pressé", "price": 25, "images": [], "ingredients": ["Ananas"] },
    { "id": 77, "cat": "Nos Jus", "name": "Jus d'Avocat", "desc": "Avocat riche et crémeux", "price": 25, "images": [], "ingredients": ["Avocat"] },
    { "id": 78, "cat": "Nos Jus", "name": "Jus de Mangue", "desc": "Mangue sucrée et douce", "price": 25, "images": [], "ingredients": ["Mangue"] },
    { "id": 79, "cat": "Nos Jus", "name": "Jus de Pêches", "desc": "Pêche veloutée", "price": 25, "images": [], "ingredients": ["Pêche"] },
    { "id": 80, "cat": "Nos Jus", "name": "Jus de Fraise", "desc": "Fraise gourmande", "price": 25, "images": [], "ingredients": ["Fraise"] },
    { "id": 81, "cat": "Nos Jus", "name": "Jus de Kiwi", "desc": "Kiwi acidulé et vitaminé", "price": 28, "images": [], "ingredients": ["Kiwi"] },
    { "id": 82, "cat": "Nos Jus", "name": "Panaché Orange", "desc": "Mélange de fruits frais à l'orange", "price": 28, "ingredients": ["Fruits mixés", "Orange"] },
    { "id": 83, "cat": "Nos Jus", "name": "Panaché au Lait", "desc": "Mix de fruits frais onctueux au lait", "price": 25, "ingredients": ["Fruits mixés", "Lait"] },
    { "id": 84, "cat": "Nos Jus", "name": "Banane à l'orange", "desc": "Le duo classique banane et orange", "price": 20, "ingredients": ["Banane", "Orange"] },
    { "id": 85, "cat": "Nos Jus", "name": "Avocat à l'orange", "desc": "Mélange surprenant d'avocat et orange", "price": 30, "ingredients": ["Avocat", "Orange"] },

    { "id": 86, "cat": "Nos Mojito", "name": "Mojito Classique", "desc": "Citron vert, menthe fraîche, eau pétillante", "price": 22, "images": [], "ingredients": ["Citron vert", "Menthe fraîche", "Eau pétillante"] },
    { "id": 87, "cat": "Nos Mojito", "name": "Mojito Kiwi", "desc": "Mojito frais au kiwi", "price": 30, "images": [], "ingredients": ["Kiwi", "Citron vert", "Menthe", "Eau pétillante"] },
    { "id": 88, "cat": "Nos Mojito", "name": "Mojito Ananas", "desc": "Mojito exotique à l'ananas", "price": 30, "images": [], "ingredients": ["Ananas", "Citron vert", "Menthe", "Eau pétillante"] },
    { "id": 89, "cat": "Nos Mojito", "name": "Mojito Mangue", "desc": "Mojito sucré à la mangue", "price": 30, "images": [], "ingredients": ["Mangue", "Citron vert", "Menthe", "Eau pétillante"] },
    { "id": 90, "cat": "Nos Mojito", "name": "Mojito Fraise", "desc": "Mojito gourmand à la fraise", "price": 30, "images": [], "ingredients": ["Fraise", "Citron vert", "Menthe", "Eau pétillante"] },
    { "id": 91, "cat": "Nos Mojito", "name": "Mojito Redbull", "desc": "Mojito énergisant au Redbull", "price": 50, "images": [], "ingredients": ["Redbull", "Citron vert", "Menthe"] },

    { "id": 92, "cat": "Nos Milkshakes", "name": "Oreo Shake", "desc": "Milkshake onctueux au biscuit Oreo", "price": 40, "images": [], "ingredients": ["Lait", "Oreo", "Glace vanille"] },
    { "id": 93, "cat": "Nos Milkshakes", "name": "Snickers Shake", "desc": "Milkshake gourmand au Snickers", "price": 40, "images": [], "ingredients": ["Lait", "Snickers", "Chocolat", "Cacahuètes"] },
    { "id": 94, "cat": "Nos Milkshakes", "name": "Mars Shake", "desc": "Milkshake doux au chocolat Mars", "price": 40, "images": [], "ingredients": ["Lait", "Mars", "Chocolat"] },
    { "id": 95, "cat": "Nos Milkshakes", "name": "Fraise Shake", "desc": "Milkshake fruité à la fraise", "price": 40, "images": [], "ingredients": ["Lait", "Fraise", "Glace"] },
    { "id": 96, "cat": "Nos Milkshakes", "name": "Banana Shake", "desc": "Milkshake onctueux à la banane", "price": 40, "images": [], "ingredients": ["Lait", "Banane", "Glace"] },
    { "id": 97, "cat": "Nos Milkshakes", "name": "Ananas Shake", "desc": "Milkshake tropical à l'ananas", "price": 40, "images": [], "ingredients": ["Lait", "Ananas", "Glace"] },
    { "id": 98, "cat": "Nos Milkshakes", "name": "Mangue Shake", "desc": "Milkshake sucré à la mangue", "price": 40, "images": [], "ingredients": ["Lait", "Mangue", "Glace"] },

    { "id": 36, "cat": "Crêpes Sucrées", "name": "Crêpe Nutella", "desc": "Le classique indémodable", "price": 30, "images": [], "ingredients": [] },
    { "id": 37, "cat": "Crêpes Sucrées", "name": "Crêpe Nutella Banane", "desc": "Duo gourmand parfait", "price": 35, "images": [], "ingredients": [] },
    { "id": 38, "cat": "Crêpes Sucrées", "name": "Crêpe Royal Nolasco", "desc": "Délice sucré suprême", "price": 50, "images": [], "ingredients": [] },

    { "id": 39, "cat": "Desserts", "name": "Tiramisu", "desc": "Fait maison", "price": 20, "images": [], "ingredients": [] },
    { "id": 40, "cat": "Desserts", "name": "Crème Caramel", "desc": "Onctueuse et douce", "price": 20, "images": [], "ingredients": [] },
    { "id": 41, "cat": "Desserts", "name": "Cheese Cake", "desc": "Fondant et fruité", "price": 20, "images": [], "ingredients": [] }
];

window.defaultCatEmojis = {
    "Petit Déjeuner": "🥞",
    "Les Salades": "🥗",
    "Les Pâtes": "🍝",
    "Pasticcio": "🥘",
    "Les Plats": "🍽️",
    "Tajine": "🏺",
    "Pizzas": "🍕",
    "Burger": "🍔",
    "Burritos": "🌯",
    "Crêpes Salées": "🌮",
    "Sandwich": "🥪",
    "Tacos": "🌯",
    "Panini": "🥖",
    "Nos Cafés": "☕",
    "Lait": "🥛",
    "Thé et Infusion": "🍵",
    "Boissons": "🥤",
    "Nos Jus": "🥤",
    "Nos Mojito": "🍹",
    "Nos Milkshakes": "🥛",
    "Crêpes Sucrées": "🥞",
    "Desserts": "🍰"
};

window.defaultSuperCategories = [
    {
        "id": "breakfast",
        "name": "Petit Déjeuner",
        "desc": "Formules Chamali, Fassi et Hollandaise",
        "emoji": "🌞",
        "cats": ["Petit Déjeuner"]
    },
    {
        "id": "cuisine",
        "name": "Cuisine & Salades",
        "desc": "Pâtes, Pasticcio et Plats cuisinés",
        "emoji": "🥘",
        "cats": ["Les Salades", "Les Pâtes", "Pasticcio", "Les Plats", "Tajine"]
    },
    {
        "id": "pizzas",
        "name": "Pizzas Artisanales",
        "desc": "Nos pizzas au feu de bois",
        "emoji": "🍕",
        "cats": ["Pizzas"]
    },
    {
        "id": "fastfood",
        "name": "Burger & Street Food",
        "desc": "Burgers, Burritos et Crêpes Salées",
        "emoji": "🍔",
        "cats": ["Burger", "Burritos", "Crêpes Salées"]
    },
    {
        "id": "wraps",
        "name": "Sandwiches & Tacos",
        "desc": "Tacos, Paninis et Sandwichs variés",
        "emoji": "🌯",
        "cats": ["Sandwich", "Tacos", "Panini"]
    },
    {
        "id": "sweets",
        "name": "Bar & Pause Sucrée",
        "desc": "Cafés, Jus, Mojitos et Desserts",
        "emoji": "🍹",
        "cats": ["Nos Cafés", "Lait", "Thé et Infusion", "Boissons", "Nos Jus", "Nos Mojito", "Nos Milkshakes", "Crêpes Sucrées", "Desserts"]
    }
];

window.defaultConfig = {
    "name": "Nolasco Restaurant",
    "location": {
        "address": "Tanger, Maroc",
        "url": "https://maps.apple.com/?address=Tangier,%20Morocco&auid=16265780283084666504&ll=35.776667,-5.803889&lsp=6489&q=Tangier"
    },
    "phone": "+212 600 000 000",
    "socials": {
        "instagram": "https://instagram.com/nolasco.tanger",
        "facebook": "https://facebook.com/nolasco.tanger",
        "tiktok": "@nolasco",
        "tripadvisor": ""
    },
    "superCategories": window.defaultSuperCategories,
    "wifi": {
        "name": "Nolasco-Guest",
        "code": "nolasco2026"
    },
    "gallery": []
};

// Initialize restaurantConfig with merged data
(function () {
    let saved = JSON.parse(localStorage.getItem('foody_config'));
    if (!saved) {
        window.restaurantConfig = { ...window.defaultConfig };
        localStorage.setItem('foody_config', JSON.stringify(window.restaurantConfig));
    } else {
        // Deep merge or at least key-level merge
        window.restaurantConfig = { ...window.defaultConfig, ...saved };
        // Ensure nested objects are also merged
        window.restaurantConfig.location = { ...window.defaultConfig.location, ...(saved.location || {}) };
        window.restaurantConfig.socials = { ...window.defaultConfig.socials, ...(saved.socials || {}) };
        window.restaurantConfig.wifi = { ...window.defaultConfig.wifi, ...(saved.wifi || {}) };
    }
})();

// --- LIKES SYSTEM ---
window.likes = JSON.parse(localStorage.getItem('foody_likes')) || {};

window.getLikeCount = function (id) {
    return window.likes[id] || 0;
};

window.toggleLike = function (id) {
    if (!window.likes[id]) window.likes[id] = 0;
    window.likes[id]++;
    localStorage.setItem('foody_likes', JSON.stringify(window.likes));
    return window.likes[id];
};

window.translations = {
    fr: {
        status_open: 'Ouvert', status_closed: 'Fermé', status_loading: 'Chargement...',
        nav_home: 'Accueil', nav_menu: 'Menu', nav_about: 'À Propos', nav_events: 'Événements', nav_gallery: 'Galerie',
        nav_contact: 'Contact', nav_hours: 'Horaires', nav_order: 'COMMANDER', nav_directions: 'ITINÉRAIRE',
        hero_sub1: 'Préparez-vous pour', hero_cta: 'COMMANDER EN LIGNE',
        hero_sub2: 'Essayez Notre', hero_desc2: 'Frites & Boisson inclus',
        hero_sub3: 'Frais Chaque Jour', hero_desc3: 'Sandwichs, Paninis & plus',
        see_order: 'Voir ma commande',
        about_tag: 'Notre Histoire', about_title: 'À Propos de <span>Foody</span>',
        about_tagline: 'Burgers, Tacos & Plus Encore',
        about_p1: "Chers invités, notre histoire commence dans les ruelles vibrantes de Tanger. Passionnés par la cuisine de rue authentique, nous avons voulu créer un lieu où chaque bouchée raconte une histoire de saveur, de fraîcheur et d'amour.",
        about_p2: 'Depuis notre humble début, nous avons toujours cru que la meilleure nourriture est celle préparée avec les ingrédients les plus frais, des recettes halal authentiques, et surtout, beaucoup de passion.',
        about_p3: 'Notre mission est simple : vous offrir la meilleure qualité, un service exceptionnel, et une expérience culinaire inoubliable.',
        about_welcome: 'Bienvenue, revenez nous voir !', about_thanks: 'Merci,',
        about_years: "Ans d'Expérience", about_items: 'Plats au Menu', about_halal: 'Halal & Frais', about_rating: 'Avis Clients',
        events_tag: 'Célébrez avec nous', events_title: 'Événements <span>Privés</span>',
        event_birthday: 'Anniversaires', event_birthday_desc: 'Célébrez votre jour spécial with a menu personnalisé et une ambiance festive.',
        event_family: 'Réunions Familiales', event_family_desc: 'Un espace chaleureux pour réunir votre famille autour de plats délicieux.',
        event_corporate: 'Événements Corporate', event_corporate_desc: 'Impressionnez vos collègues with a traiteur professionnel et savoureux.',
        event_party: 'Fêtes Privées', event_party_desc: 'Louez notre espace pour une soirée inoubliable with vos amis.',
        events_cta_text: 'Intéressé par un événement ? Contactez-nous !', events_cta_btn: '📩 Demander un Devis',
        event_reserve: 'Réserver maintenant',
        hours_tag: 'Quand nous visiter', hours_title: "Horaires <span>d'Ouverture</span>",
        day_mon: 'Lundi', day_tue: 'Mardi', day_wed: 'Mercredi', day_thu: 'Jeudi', day_fri: 'Vendredi', day_sat: 'Samedi', day_sun: 'Dimanche',
        hours_note: '🔥 Ouvert tous les jours ! Livraison disponible.',
        pf_payments_title: 'Les Modes De Paiement', pf_facilities_title: 'Facilités',
        gallery_tag: 'Moments Foody', gallery_title: 'Notre <span>Galerie</span>',
        contact_tag: 'Venez Manger', contact_title: 'Contactez-<span>Nous</span>',
        contact_address_title: 'Adresse', contact_phone_title: 'Téléphone',
        side_menu: 'MENU', side_wifi: 'CODE WIFI', side_insta: 'INSTAGRAM',
        wifi_title: 'WiFi Gratuit', wifi_scan: 'Scannez pour vous connecter',
        promo_badge: 'PROMO DU JOUR', promo_add: 'AJOUTER AU PANIER',
        ingredients_label: 'Ingrédients', add_to_cart: 'AJOUTER AU PANIER',
        ticket_title: 'VOTRE TICKET', ticket_subtitle: 'Merci de votre confiance!',
        ticket_order_no: 'Commande N°', ticket_date: 'Date', ticket_total: 'TOTAL',
        ticket_service: 'Mode', ticket_client: 'Client', ticket_addr: 'Adresse',
        ticket_footer: 'Veuillez présenter ce ticket à la caisse.',
    },
    en: {
        status_open: 'Open', status_closed: 'Closed', status_loading: 'Loading...',
        nav_home: 'Home', nav_menu: 'Menu', nav_about: 'About Us', nav_events: 'Events', nav_gallery: 'Gallery',
        nav_contact: 'Contact Us', nav_hours: 'Hours', nav_order: 'ORDER ONLINE', nav_directions: 'GET DIRECTIONS',
        hero_sub1: 'Get ready for', hero_cta: 'ORDER ONLINE',
        hero_sub2: 'Try Our', hero_desc2: 'Includes Fries & Drink',
        hero_sub3: 'Fresh Daily', hero_desc3: 'Sandwiches, Paninis & more',
        see_order: 'See my order',
        about_tag: 'Our Story', about_title: 'About <span>Foody</span>',
        about_tagline: 'Burgers, Tacos & More',
        about_p1: 'Dear guests, our story begins in the vibrant streets of Tangier. Passionate about authentic street food, we wanted to create a place where every bite tells a story of flavor, freshness and love.',
        about_p2: 'Since our humble beginnings, we have always believed that the best food is made with the freshest ingredients, authentic halal recipes, and above all, plenty of passion.',
        about_p3: 'Our mission is simple: to offer you the best quality, exceptional service, and an unforgettable culinary experience.',
        about_welcome: 'Welcome, please come visit us again!', about_thanks: 'Thank you,',
        about_years: 'Years Experience', about_items: 'Menu Items', about_halal: 'Halal & Fresh', about_rating: 'Customer Reviews',
        events_tag: 'Celebrate with us', events_title: 'Private <span>Events</span>',
        event_birthday: 'Birthdays', event_birthday_desc: 'Celebrate your special day with a custom menu and festive ambiance.',
        event_family: 'Family Gatherings', event_family_desc: 'A warm space to bring your family together around delicious dishes.',
        event_corporate: 'Corporate Events', event_corporate_desc: 'Impress your colleagues with professional and tasty catering.',
        event_party: 'Private Parties', event_party_desc: 'Rent our space for an unforgettable evening with friends.',
        events_cta_text: 'Interested in an event? Contact us!', events_cta_btn: '📩 Request a Quote',
        event_reserve: 'Book Now',
        hours_tag: 'When to visit', hours_title: 'Opening <span>Hours</span>',
        day_mon: 'Monday', day_tue: 'Mardi', day_wed: 'Wednesday', day_thu: 'Thursday', day_fri: 'Friday', day_sat: 'Saturday', day_sun: 'Sunday',
        hours_note: '🔥 Open every day! Delivery available.',
        pf_payments_title: 'Payment Methods', pf_facilities_title: 'Facilities',
        gallery_tag: 'Foody Moments', gallery_title: 'Our <span>Gallery</span>',
        contact_tag: 'Come eat', contact_title: 'Contact <span>Us</span>',
        contact_address_title: 'Address', contact_phone_title: 'Phone',
        side_menu: 'MENU', side_wifi: 'WIFI CODE', side_insta: 'INSTAGRAM',
        wifi_title: 'Free WiFi', wifi_scan: 'Scan to connect',
        "event_booking_subtitle": "Share your details with us",
        "featured_label": "Nolasco Selection",
        "featured_best": "Our Favorites ✨",
        promo_badge: 'PROMO OF THE DAY', promo_add: 'ADD TO CART',
        ingredients_label: 'Ingredients', add_to_cart: 'ADD TO CART',
        ticket_title: 'YOUR TICKET', ticket_subtitle: 'Thank you for your order!',
        ticket_order_no: 'Order No', ticket_date: 'Date', ticket_total: 'TOTAL',
        ticket_service: 'Mode', ticket_client: 'Client', ticket_addr: 'Address',
        ticket_footer: 'Please show this ticket at the counter.',
    },
    ar: {
        status_open: 'مفتوح', status_closed: 'مغلق', status_loading: 'جاري التحميل...',
        nav_home: 'الرئيسية', nav_menu: 'القائمة', nav_about: 'من نحن', nav_events: 'الفعاليات', nav_gallery: 'المعرض',
        nav_contact: 'اتصل بنا', nav_hours: 'أوقات العمل', nav_order: 'اطلب الآن', nav_directions: 'الاتجاهات',
        hero_sub1: 'استعد لـ', hero_cta: 'اطلب أونلاين',
        hero_sub2: 'جرب', hero_desc2: 'مع بطاطس ومشروب',
        hero_sub3: 'طازج يومياً', hero_desc3: 'سندويشات، بانيني والمزيد',
        see_order: 'عرض طلبي',
        about_tag: 'قصتنا', about_title: 'عن <span>فودي</span>',
        about_tagline: 'برجر، تاكوس والمزيد',
        about_p1: 'أعزاءنا الضيوف، تبدأ قصتنا في أزقة طنجة النابضة بالحياة. شغوفون بالأكل الشعبي الأصيل، أردنا خلق مكان كل لقمة فيه تحكي قصة نكهة وطزاجة وحب.',
        about_p2: 'منذ بدايتنا المتواضعة، آمنا دائماً أن أفضل طعام يُحضّر بأطزج المكونات، ووصفات حلال أصيلة، وقبل كل شيء، بالكثير من الشغف.',
        about_p3: 'مهمتنا بسيطة: تقديم أفضل جودة، خدمة استثنائية، وتجربة طعام لا تُنسى.',
        about_welcome: 'مرحباً، عودوا لزيارتنا!', about_thanks: 'شكراً لكم،',
        about_years: 'سنة خبرة', about_items: 'طبق في القائمة', about_halal: 'حلال وطازج', about_rating: 'آراء الزبائن',
        events_tag: 'احتفل معنا', events_title: 'فعاليات <span>خاصة</span>',
        event_birthday: 'أعياد الميلاد', event_birthday_desc: 'احتفل بيومك الخاص مع قائمة مخصصة وأجواء احتفالية.',
        event_family: 'لقاءات عائلية', event_family_desc: 'مساحة دافئة لجمع عائلتك حول أطباق لذيذة.',
        event_corporate: 'فعاليات الشركات', event_corporate_desc: 'أبهر زملاءك بتقديم طعام احترافي ولذيذ.',
        event_party: 'حفلات خاصة', event_party_desc: 'استأجر مساحتنا لسهرة لا تُنسى مع أصدقائك.',
        events_cta_text: 'مهتم بفعالية؟ تواصل معنا!', events_cta_btn: '📩 اطلب عرض سعر',
        event_reserve: 'احجز الآن',
        hours_tag: 'متى تزورنا', hours_title: 'أوقات <span>العمل</span>',
        day_mon: 'الاثنين', day_tue: 'الثلاثاء', day_wed: 'الأربعاء', day_thu: 'الخميس', day_fri: 'الجمعة', day_sat: 'السبت', day_sun: 'الأحد',
        hours_note: '🔥 مفتوح كل يوم! التوصيل متاح.',
        pf_payments_title: 'طرق الدفع', pf_facilities_title: 'التسهيلات',
        gallery_tag: 'لحظات فودي', gallery_title: '<span>معرضنا</span>',
        contact_tag: 'تعال كُل', contact_title: 'اتصل <span>بنا</span>',
        contact_address_title: 'العنوان', contact_phone_title: 'الهاتف',
        side_menu: 'القائمة', side_wifi: 'كود الواي فاي', side_insta: 'إنستغرام',
        wifi_title: 'واي فاي مجاني', wifi_scan: 'امسح الرمز للاتصال',
        "event_booking_subtitle": "شاركنا تفاصيلك",
        "featured_label": "مختارات نولاسكو",
        "featured_best": "أفضل أطباقنا ✨",
        promo_badge: 'عرض اليوم', promo_add: 'أضف إلى السلة',
        ingredients_label: 'المكونات', add_to_cart: 'أضف إلى السلة',
        ticket_title: 'تذكرتك', ticket_subtitle: 'شكراً لثقتكم!',
        ticket_order_no: 'طلب رقم', ticket_date: 'التاريخ', ticket_total: 'المجموع',
        ticket_service: 'الخدمة', ticket_client: 'الزبون', ticket_addr: 'العنوان',
        ticket_footer: 'يرجى تقديم هذه التذكرة عند الكاشير.',
    }
};

// --- PROMO & DISCOUNT HELPERS ---
window.getPromoIds = function () {
    // Priority 1: Use window.promoIds if set (usually by menu.js or admin.js sync)
    if (window.promoIds && Array.isArray(window.promoIds) && window.promoIds.length > 0) {
        return window.promoIds;
    }
    // Priority 2: Fallback to localStorage (legacy/local-only support)
    try {
        let ids = JSON.parse(localStorage.getItem('foody_promo_ids'));
        return Array.isArray(ids) ? ids : [];
    } catch (e) {
        return [];
    }
};

window.isItemInPromo = function (id) {
    return window.getPromoIds().includes(Number(id));
};

window.getItemPrice = function (item, sizeKey) {
    let basePrice = item.price;

    if (item.hasSizes && item.sizes) {
        if (sizeKey && item.sizes[sizeKey.toLowerCase()]) {
            basePrice = item.sizes[sizeKey.toLowerCase()];
        } else {
            // Default to small or the logic-defined price if no size specified
            basePrice = item.sizes.small || item.sizes.medium || item.sizes.large || item.price;
        }
    }

    if (window.isItemInPromo(item.id)) {
        return basePrice * 0.8; // 20% Discount
    }
    return basePrice;
};

window.currentLang = 'fr';

window.setLang = function (lang, btn) {
    window.currentLang = lang;

    // Update Dropdown Display
    const displayEl = document.getElementById('currentLangDisplay');
    if (displayEl) {
        const labels = { 'fr': 'FR', 'en': 'EN', 'ar': 'AR' };
        displayEl.textContent = labels[lang] || lang.toUpperCase();
    }

    // Close dropdown
    const opts = document.getElementById('langOptions');
    if (opts) opts.classList.remove('open');

    // Update active state for buttons if they exist
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active-lang'));
    if (btn) btn.classList.add('active-lang');

    const dict = window.translations[lang];
    if (!dict) return;

    // Set RTL for Arabic
    const html = document.getElementById('htmlRoot') || document.documentElement;
    if (lang === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
    } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', lang);
    }

    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (dict[key].includes('<span>')) {
                el.innerHTML = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });

    // Update status based on language
    window.updateStatus();

    // Save preference
    localStorage.setItem('foody_lang', lang);
};

window.updateStatus = function () {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    let isOpen = false;
    if (day >= 1 && day <= 4) {
        if (hour >= 11 && hour < 23) isOpen = true;
    } else if (day === 5 || day === 6) {
        if (hour >= 11 && hour <= 23) isOpen = true;
    } else if (day === 0) {
        if (hour >= 12 && hour < 23) isOpen = true;
    }

    const badge = document.getElementById('statusBadge');
    if (!badge) return isOpen;
    badge.className = 'status-badge ' + (isOpen ? 'status-open' : 'status-closed');
    const textEl = document.getElementById('statusText');
    if (textEl) {
        textEl.setAttribute('data-i18n', isOpen ? 'status_open' : 'status_closed');
        textEl.textContent = isOpen ? 'Ouvert' : 'Fermé';
    }
    return isOpen;
};

window.showToast = function (text) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = text;
    document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 50);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 2000);
};

// Default Opening Hours
window.defaultHours = [
    { day: 'Lundi', i18n: 'day_mon', open: '11:00', close: '23:00', highlight: false },
    { day: 'Mardi', i18n: 'day_tue', open: '11:00', close: '23:00', highlight: false },
    { day: 'Mercredi', i18n: 'day_wed', open: '11:00', close: '23:00', highlight: false },
    { day: 'Jeudi', i18n: 'day_thu', open: '11:00', close: '23:00', highlight: false },
    { day: 'Vendredi', i18n: 'day_fri', open: '11:00', close: '00:00', highlight: false },
    { day: 'Samedi', i18n: 'day_sat', open: '11:00', close: '00:00', highlight: true },
    { day: 'Dimanche', i18n: 'day_sun', open: '12:00', close: '23:00', highlight: true }
];
window.defaultHoursNote = '🔥 Ouvert tous les jours ! Livraison disponible.';

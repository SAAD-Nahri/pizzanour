const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

data.branding.restaurantName = "Pizzeria Nour";
data.branding.shortName = "Nour";
data.branding.tagline = "L'excellence culinaire et de la gastronomie à Tanger.";
data.branding.logoMark = "🍕";
data.branding.logoImage = "uploads/pizzeria_nour_logo.png";

if (!data.landing) data.landing = {};
data.landing.location = "Rue Figuig, Tanger, Morocco";
data.landing.phone = "05 39 32 15 79";

if (!data.social) data.social = {};
data.social.whatsapp = "0539321579";

data.hours = [
  {"day": "Lundi", "open": "11:00", "close": "23:00"},
  {"day": "Mardi", "open": "11:00", "close": "23:00"},
  {"day": "Mercredi", "open": "11:00", "close": "23:00"},
  {"day": "Jeudi", "open": "11:00", "close": "23:00"},
  {"day": "Vendredi", "open": "14:00", "close": "23:30"},
  {"day": "Samedi", "open": "11:00", "close": "00:00"},
  {"day": "Dimanche", "open": "11:00", "close": "00:00"}
];
data.hoursNote = " Ouvert tous les jours ! Livraison disponible sur Tanger.";

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log("Config updated.");

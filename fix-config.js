const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Fix location object
data.landing = data.landing || {};
data.landing.location = {
  address: "Rue Figuig, Tanger, Morocco",
  url: "https://www.google.com/maps/place/pizzeria+nour+tanger"
};
data.landing.phone = "05 39 32 15 79";

// Fix social object
data.social = data.social || {};
data.social.instagram = "https://instagram.com/nour";
data.social.whatsapp = "05 39 32 15 79";

// Fix wifi object
data.wifi = data.wifi || {};
data.wifi.ssid = "nour";
data.wifi.pass = "nour123";

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log("Fixed config fields.");

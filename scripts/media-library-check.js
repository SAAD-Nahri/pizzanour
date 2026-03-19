const {
  MEDIA_LIBRARY_CATALOG_FILE,
  ensureMediaLibraryStructure,
  getMediaLibraryStats
} = require("../media-library/library");

ensureMediaLibraryStructure();

const stats = getMediaLibraryStats();

console.log("Media library catalog:", MEDIA_LIBRARY_CATALOG_FILE);
console.log(`Assets: ${stats.assetCount}`);
console.log(`Approved assets: ${stats.approvedCount}`);
console.log(`Pending assets: ${stats.pendingCount}`);
console.log(`Recipes: ${stats.recipeCount}`);
console.log(`Matches: ${stats.matchCount}`);
console.log(`By slot: hero=${stats.countsBySlot.hero}, gallery=${stats.countsBySlot.gallery}, product=${stats.countsBySlot.product}`);
console.log(`By source: client=${stats.countsBySource.client}, curated=${stats.countsBySource.curated}, generated=${stats.countsBySource.generated}, placeholder=${stats.countsBySource.placeholder}`);

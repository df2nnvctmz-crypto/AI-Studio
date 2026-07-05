const https = require('https');

function fetchOFF(query) {
  return new Promise((resolve) => {
    https.get('https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(query) + '&search_simple=1&action=process&json=1', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.products[0]);
        } catch(e) { resolve(null); }
      });
    });
  });
}

async function main() {
  const items = ["banana", "avocado", "salmon", "coca cola", "spinach", "greek yogurt", "almonds"];
  for (const item of items) {
    const product = await fetchOFF(item);
    if (product) {
      console.log(item + " -> " + product.product_name + ", kcal: " + product.nutriments?.['energy-kcal_100g']);
    }
  }
}
main();

const got = require('got');
const Sneaker = require('../models/Sneaker');

module.exports = {
    getProductsAndInfo: async function (key, count) {
        try {
            const response = await got.post('https://xw7sbct9v6-1.algolianet.com/1/indexes/products/query', {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
                  'Accept': 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'X-Algolia-API-Key': '6b5e76b49705eb9f51a06d3c82f7acee',
                  'X-Algolia-Application-Id': 'XW7SBCT9V6'
              },
                body: `{"params":"query=${encodeURIComponent(key)}&facets=*&filters=&hitsPerPage=${count}"}`,
                responseType: 'json',
                http2: true
            });

            if (!response.body.hits || response.body.hits.length === 0) {
                throw new Error('No products found');
            }

            let products = response.body.hits.map(hit => {
                if (!hit.style_id || hit.style_id.includes(' ')) {
                    return null;
                }

                return new Sneaker({
                    shoeName: hit.name,
                    brand: hit.brand,
                    silhouette: hit.make,
                    styleID: hit.style_id,
                    make: hit.make,
                    colorway: hit.colorway,
                    retailPrice: hit.searchable_traits['Retail Price'],
                    thumbnail: hit.media.imageUrl,
                    releaseDate: hit.release_date,
                    description: hit.description,
                    urlKey: hit.url,
                    resellLinks: {
                        stockX: `https://stockx.com/${hit.url}`
                    },
                    lowestResellPrice: { stockX: hit.lowest_ask }
                });
            }).filter(shoe => shoe !== null);

            return products;
        } catch (error) {
            console.error(`Error connecting to StockX for keyword ${key}:`, error);
            throw error;
        }
    },

    getPrices: async function (shoe) {
        try {
            const response = await got(`https://stockx.com/api/products/${shoe.urlKey}?includes=market`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
                },
                responseType: 'json',
                http2: true
            });

            let json = response.body;
            let priceMap = {};

            for (let key in json.Product.children) {
                let child = json.Product.children[key];
                if (child.market.lowestAsk === 0) continue;

                let size = child.shoeSize.replace('W', ''); // Remove 'W' for women's sizes
                priceMap[size] = child.market.lowestAsk;
            }

            shoe.resellPrices.stockX = priceMap;
        } catch (error) {
            console.error(`Error fetching prices for ${shoe.styleID} from StockX:`, error);
            shoe.resellPrices.stockX = {};
        }
    }
}

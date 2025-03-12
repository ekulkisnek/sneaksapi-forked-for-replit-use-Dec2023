const stockXScraper = require('../scrapers/stockx-scraper');
const flightClubScraper = require('../scrapers/flightclub-scraper');
const goatScraper = require('../scrapers/goat-scraper');
const stadiumGoodsScraper = require('../scrapers/stadiumgoods-scraper');
const Database = require("@replit/database");
const db = new Database();

class Sneaks {
    async getProducts(keyword, count = 40) {
        const key = `products_${keyword}_${count}`;

        // Always scrape new products instead of using cached data
        let products = await this.scrapeProducts(keyword, count);
        if (!products.length) {
            return { products: [], error: "No products found" };
        }

        // Cache the products for logging or future use
        await db.set(key, JSON.stringify({ timestamp: new Date(), products }));
        return { products, error: null };
    }

    async scrapeProducts(keyword, count) {
        try {
            let stockXProducts = await stockXScraper.getProductsAndInfo(keyword, count);
            const otherScrapers = [flightClubScraper, stadiumGoodsScraper, goatScraper];
            for (let shoe of stockXProducts) {
                for (let scraper of otherScrapers) {
                    try {
                        await scraper.getLink(shoe);
                    } catch (error) {
                        console.error(`Error scraping ${scraper.name} for ${shoe.styleID}:`, error);
                    }
                }
            }
            return stockXProducts;
        } catch (error) {
            console.error("Error scraping products:", error);
            return [];
        }
    }

    async getProductPrices(shoeID) {
        const key = `prices_${shoeID}`;

        // Always scrape new prices instead of using cached data
        let prices = await this.scrapeProductPrices(shoeID);

        // Cache the prices for logging or future use
        await db.set(key, JSON.stringify(prices));
        return { prices, error: null };
    }

    async scrapeProductPrices(shoeID) {
        const prices = {};
  
        const scrapers = [stockXScraper, flightClubScraper, goatScraper, stadiumGoodsScraper];
        const scraperNames = ['stockX', 'flightClub', 'goat', 'stadiumGoods'];
  
        for (let i = 0; i < scrapers.length; i++) {
            try {
                let priceData = await scrapers[i].getPrices(shoeID);
                prices[scraperNames[i]] = priceData;
            } catch (error) {
                console.error(`Error scraping prices from ${scraperNames[i]} for ${shoeID}:`, error);
                prices[scraperNames[i]] = 'Error or no data available';
            }
        }
  
        return prices;
    }


    async getMostPopular(count = 40) {
        const key = `most_popular_${count}`;

        // Always scrape new products instead of using cached data
        let products = await this.scrapeProducts("", count);
        if (!products.length) {
            return { products: [], error: "No products found" };
        }

        // Cache the products for logging or future use
        await db.set(key, JSON.stringify({ timestamp: new Date(), products }));
        return { products, error: null };
    }

    async findAll() {
        // List and return all products from the database
        const keys = await db.list("products_");
        const productPromises = keys.map(key => db.get(key));
        const products = await Promise.all(productPromises);
        return { products: products.map(JSON.parse), error: null };
    }
}

module.exports = Sneaks;

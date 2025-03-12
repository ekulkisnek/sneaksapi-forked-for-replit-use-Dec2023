const stockXScraper = require('./scrapers/stockx-scraper');
const flightClubScraper = require('./scrapers/flightclub-scraper');
const goatScraper = require('./scrapers/goat-scraper');
const stadiumGoodsScraper = require('./scrapers/stadiumgoods-scraper');
const SneaksAPI = require('./controllers/sneaks.controllers');
const sneaks = new SneaksAPI();

async function testScraper(scraper, name, testInput) {
    const shoe = { styleID: testInput, resellLinks: {}, lowestResellPrice: {} };

    try {
        console.log(`Testing ${name} Scraper with input: ${testInput}`);
        await scraper.getLink(shoe);
        console.log(`${name} Scraper Link Result: `, shoe.resellLinks);

        await scraper.getPrices(shoe);
        console.log(`${name} Scraper Prices Result: `, shoe.lowestResellPrice);

        // If getPictures method is available
        if (scraper.getPictures) {
            await scraper.getPictures(shoe);
            console.log(`${name} Scraper Pictures Result: `, shoe.imageLinks);
        }
    } catch (error) {
        console.error(`${name} Scraper Error: `, error.message);
    }
}

async function testSneaksAPI() {
    try {
        console.log("Testing Most Popular Products from SneaksAPI");
        const { products: popularProducts, error: popularError } = await sneaks.getMostPopular(10);
        if (popularError) throw new Error(popularError);
        console.log("Most Popular Products: ", popularProducts);

        console.log("Testing Search Functionality in SneaksAPI");
        const { products: searchProducts, error: searchError } = await sneaks.getProducts('Yeezy', 10);
        if (searchError) throw new Error(searchError);
        console.log("Search Results: ", searchProducts);
    } catch (error) {
        console.error("SneaksAPI Error: ", error.message);
    }
}

async function runTests() {
    // Replace 'Yeezy' with a relevant test keyword for your scrapers
    await testScraper(stockXScraper, 'StockX', 'Yeezy');
    await testScraper(flightClubScraper, 'FlightClub', 'Yeezy');
    await testScraper(goatScraper, 'Goat', 'Yeezy');
    await testScraper(stadiumGoodsScraper, 'StadiumGoods', 'Yeezy');

    await testSneaksAPI();
}

runTests();

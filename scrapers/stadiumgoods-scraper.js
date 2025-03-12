const got = require('got');
const cheerio = require('cheerio'); // Ensure you have cheerio installed

module.exports = {
    getLink: async function (shoe) {
        try {
            const response = await got.post('https://graphql.stadiumgoods.com/graphql', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15',
                    'Content-Type': 'application/json'
                },
                json: {
                    operationId: "sg-front/cached-a41eba558ae6325f072164477a24d3c2",
                    variables: {
                        initialSearchQuery: shoe.styleID,
                        initialSort: "RELEVANCE",
                        // Other variables can be added as needed
                    },
                    locale: "en_US"
                },
                responseType: 'json'
            });

            const product = response.body?.data?.configurableProducts?.edges[0]?.node;
            if (product) {
                shoe.resellLinks.stadiumGoods = product.pdpUrl;
                const lowestPrice = product.lowestPrice.__typename === 'DiscountedPrice' 
                    ? product.lowestPrice.originalValue.formattedValue 
                    : product.lowestPrice.value.formattedValue;
                shoe.lowestResellPrice.stadiumGoods = parseFloat(lowestPrice.replace(/[^0-9.-]+/g, ""));
            } else {
                throw new Error(`Product '${shoe.styleID}' not found on Stadium Goods`);
            }
        } catch (error) {
            console.error(`Error in StadiumGoods getLink for '${shoe.styleID}':`, error);
        }
    },

    getPrices: async function (shoe) {
        if (!shoe.resellLinks.stadiumGoods) return;

        try {
            const response = await got(shoe.resellLinks.stadiumGoods, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; rv:20.0) Gecko/20121202 Firefox/20.0'
                }
            });

            const $ = cheerio.load(response.body);
            const priceMap = {};

            $('.product-sizes__input').each((_, product) => {
                if ($(product).attr('data-stock') === 'true') {
                    const size = $(product).attr('data-size').replace('W', '');
                    const price = parseInt($(product).attr('data-amount'), 10) / 100;
                    priceMap[size] = price;
                }
            });

            shoe.resellPrices.stadiumGoods = priceMap;
        } catch (error) {
            console.error(`Error in StadiumGoods getPrices for '${shoe.styleID}':`, error);
        }
    }
};

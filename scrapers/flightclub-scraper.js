const got = require('got');

module.exports = {
    getLink: async function (shoe) {
        try {
            const algoliaUrl = "https://2fwotdvm2o-dsn.algolia.net/1/indexes/*/queries";
            const algoliaHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; rv:20.0) Gecko/20121202 Firefox/20.0',
                'Content-Type': 'application/json',
                'x-algolia-agent': 'Algolia for vanilla JavaScript (lite) 3.32.0;react-instantsearch 5.4.0;JS Helper 2.26.1',
                'x-algolia-application-id': '2FWOTDVM2O',
                'x-algolia-api-key': 'ac96de6fef0e02bb95d433d8d5c7038a'
            };
            const algoliaBody = {
                requests: [{
                    indexName: "product_variants_v2_flight_club",
                    params: `query=${shoe.styleID}&hitsPerPage=1&maxValuesPerFacet=1&facets=["lowest_price_cents_usd"]`
                }]
            };

            const response = await got.post(algoliaUrl, { headers: algoliaHeaders, body: JSON.stringify(algoliaBody), http2: true });
            const json = JSON.parse(response.body);

            if (json.results[0].hits.length) {
                const hit = json.results[0].hits[0];
                shoe.lowestResellPrice.flightClub = hit.lowest_price_cents_usd / 100;
                shoe.resellLinks.flightClub = `https://www.flightclub.com/${hit.slug}`;
                shoe.description = hit.story;
            }
            return shoe;
        } catch (error) {
            console.error(`Error connecting to Flight Club for '${shoe.styleID}':`, error);
            throw error;
        }
    },

    getPrices: async function (shoe) {
        if (!shoe.resellLinks.flightClub) {
            console.error("Flight Club link not found for the shoe:", shoe.styleID);
            return;
        }

        try {
            const slug = shoe.resellLinks.flightClub.split('.com/')[1];
            const tokenResponse = await got('https://www.flightclub.com/token', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; rv:20.0) Gecko/20121202 Firefox/20.0'
                },
                http2: true
            });
            const token = tokenResponse.body;

            const graphqlResponse = await got.post('https://www.flightclub.com/graphql', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; rv:20.0) Gecko/20121202 Firefox/20.0',
                    'Content-Type': 'application/json',
                    'x-csrf-token': token,
                    'cookie': 'Your cookies here' // Replace with actual cookies if necessary
                },
                body: JSON.stringify({
                    operationName: "getProductTemplate",
                    variables: { slug },
                    query: "Your GraphQL query here" // Replace with the actual GraphQL query
                }),
                http2: true
            });

            const json = JSON.parse(graphqlResponse.body);
            let priceMap = {};

            json.data.getProductTemplate.newSizes.forEach(size => {
                priceMap[size.size.display] = size.lowestPriceOption.price.value / 100;
            });

            shoe.resellPrices.flightClub = priceMap;
            return shoe;
        } catch (error) {
            console.error(`Error fetching prices from Flight Club for '${shoe.styleID}':`, error);
            // Optionally, you can return an empty price map or the shoe object as it is
            return shoe;
        }
    }
};

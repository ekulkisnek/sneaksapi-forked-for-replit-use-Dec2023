const got = require('got');

module.exports = {
  getLink: async function (shoe) {
    try {
      const algoliaHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; rv:20.0) Gecko/20121202 Firefox/20.0',
        'Content-Type': 'application/json',
        'x-algolia-agent': 'Algolia for vanilla JavaScript (lite) 3.25.1;react (16.9.0);react-instantsearch (6.2.0);JS Helper (3.1.0)',
        'x-algolia-application-id': '2FWOTDVM2O',
        'x-algolia-api-key': 'ac96de6fef0e02bb95d433d8d5c7038a'
      };
      const algoliaBody = {
        requests: [{
          indexName: "product_variants_v2",
          params: `distinct=true&maxValuesPerFacet=1&page=0&query=${shoe.styleID}&facets=["instant_ship_lowest_price_cents"]`
        }]
      };

      const response = await got.post('https://2fwotdvm2o-dsn.algolia.net/1/indexes/*/queries', {
        headers: algoliaHeaders,
        json: algoliaBody,
        responseType: 'json'
      });

      const hit = response.body.results[0]?.hits[0];
      if (hit) {
        shoe.lowestResellPrice.goat = hit.lowest_price_cents_usd / 100;
        shoe.resellLinks.goat = `http://www.goat.com/sneakers/${hit.slug}`;
        shoe.goatProductId = hit.product_template_id;
      }
    } catch (error) {
      console.error(`Error in Goat scraper for '${shoe.styleID}':`, error);
    }
  },

  getPrices: async function (shoe) {
    if (!shoe.resellLinks.goat) return;

    try {
      const apiLink = `http://www.goat.com/web-api/v1/product_variants/buy_bar_data?productTemplateId=${shoe.goatProductId}`;
      const response = await got(apiLink, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; rv:20.0) Gecko/20121202 Firefox/20.0',
          'Content-Type': 'application/json',
        },
        responseType: 'json'
      });

      const priceMap = {};
      response.body.forEach(item => {
        if (item.shoeCondition === 'used') return;
        const size = item.sizeOption.value;
        const price = item.lowestPriceCents.amount / 100;
        priceMap[size] = priceMap[size] ? Math.min(priceMap[size], price) : price;
      });

      shoe.resellPrices.goat = priceMap;
    } catch (error) {
      console.error(`Error in Goat scraper prices for '${shoe.styleID}':`, error);
    }
  },

  getPictures: async function (shoe) {
    if (!shoe.resellLinks.goat) return;

    try {
      const apiLink = shoe.resellLinks.goat.replace('sneakers', 'web-api/v1/product_templates');
      const response = await got(apiLink, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; rv:20.0) Gecko/20121202 Firefox/20.0',
          'Content-Type': 'application/json',
        },
        responseType: 'json'
      });

      const pictures = response.body.productTemplateExternalPictures;
      if (pictures) {
        shoe.imageLinks = pictures.map(pic => pic.mainPictureUrl);
      }
    } catch (error) {
      console.error(`Error in Goat scraper pictures for '${shoe.styleID}':`, error);
    }
  }
};

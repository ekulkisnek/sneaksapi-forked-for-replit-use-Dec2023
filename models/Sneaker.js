// sneaker.js

class Sneaker {
    constructor({ shoeName, brand, silhoutte, styleID, retailPrice, releaseDate, description, imageLinks, thumbnail, urlKey, make, goatProductId, colorway, resellLinks, size, lowestResellPrice, resellPrices }) {
        this.shoeName = shoeName;
        this.brand = brand;
        this.silhoutte = silhoutte;
        this.styleID = styleID;
        this.retailPrice = retailPrice;
        this.releaseDate = releaseDate;
        this.description = description;
        this.imageLinks = imageLinks || [];
        this.thumbnail = thumbnail;
        this.urlKey = urlKey;
        this.make = make;
        this.goatProductId = goatProductId;
        this.colorway = colorway;
        this.resellLinks = resellLinks || {};
        this.size = size;
        this.lowestResellPrice = lowestResellPrice || {};
        this.resellPrices = resellPrices || {};
    }
}

module.exports = Sneaker;

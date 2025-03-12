const SneaksAPI = require('../controllers/sneaks.controllers.js');
const sneaks = new SneaksAPI();

module.exports = (app) => {
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get('/id/:id', async (req, res) => {
        try {
            const { product, error } = await sneaks.getProductDetails(req.params.id.toUpperCase());
            if (error) {
                res.status(404).json({ error });
            } else {
                res.json(product);
            }
        } catch (error) {
            console.error("Error in /id/:id:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get('/id/:id/prices', async (req, res) => {
        try {
            const { prices, error } = await sneaks.getProductPrices(req.params.id.toUpperCase());
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json({ prices });
            }
        } catch (error) {
            console.error("Error in /id/:id/prices:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get('/home', async (req, res) => {
        try {
            const count = req.query.count || 40;
            const { products, error } = await sneaks.getMostPopular(count);
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json(products);
            }
        } catch (error) {
            console.error("Error in /home:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get('/search/:shoe', async (req, res) => {
        try {
            const count = req.query.count || 40;
            const { products, error } = await sneaks.getProducts(req.params.shoe, count);
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json(products);
            }
        } catch (error) {
            console.error("Error in /search/:shoe:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get('/shoes', async (req, res) => {
        try {
            const { products, error } = await sneaks.findAllProducts();
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json(products);
            }
        } catch (error) {
            console.error("Error in /shoes:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get('/', (req, res) => {
        res.redirect('/home');
    });
};

const express = require("express");
const routes = express();
const ProductController = require("../controller/ProductController");
// const createValidation = require("../middleware/validation");
// const updateValidation = require("../middleware/validation1");
const { isAuthorized, isAdmin } = require("../middleware/auth");

routes.get("/all", ProductController.getAll);
routes.post("/review/:productId", ProductController.addReview);
routes.get("/review/:productId", ProductController.getAllReviews);
// routes.get("/details/:id", ProductController.getOneById);
// routes.get("/search", ProductController.querySearch);
// routes.delete("/details", ProductController.deleteById);
routes.post("/create", isAuthorized,isAdmin , ProductController.create);
// routes.patch("/details/:id", updateValidation, ProductController.update);



module.exports = routes;
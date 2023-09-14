const express = require("express");
const routes = express();
const TransactionController = require("../controller/TransactionController");
// const { userValidator } = require("../middleware/validation");

// routes.get("/all", TransactionController.getAll);
// routes.get("/:id", TransactionController.getById);
routes.post("/create", TransactionController.checkOut);
// routes.delete("/delete/:id", TransactionController.deleteById);
// routes.patch("/update/:id", TransactionController.updateById);
// routes.delete("/delete-all", TransactionController.deleteAll);

module.exports = routes;

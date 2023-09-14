const express = require("express");
const cors = require("cors");
const app = express();
// const UserRouter = require("./routes/User");
const ProductRouter = require("./routes/Product");
const TransactionRouter = require("./routes/Transaction");
const CartRouter = require("./routes/Cart");
// const AuthRouter = require("./routes/Auth");
// const ProductModel = require("../model/Product");
const dotenv = require("dotenv");
const databaseConnection = require("./config/database");

dotenv.config();

app.use(cors({ origin: "*" }));
app.use(express.json()); 
app.use(express.text()); 
app.use(express.urlencoded({ extended: true })); 

app.use("/products", ProductRouter);
// app.use("/users", UserRouter);
app.use("/transactions", TransactionRouter);
app.use("/cart", CartRouter);
// app.use("/users", AuthRouter);


databaseConnection(() => {
  app.listen(8000, () => {
    console.log("Server is running on port 8000");
  });
});

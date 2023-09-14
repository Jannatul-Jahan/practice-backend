const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const TransactionModel = require("../model/Transaction");
const Product = require("../model/Product");
const Cart = require("../model/Cart");
const HTTP_STATUS = require("../constants/statusCodes");

class TransactionController {

  async checkOut(req, res) {
    try {
      const validationErrors = validationResult(req).array();
      if (validationErrors.length > 0) {
        return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Validation failed", validationErrors));
      }
  
      const { cart, user } = req.body;
  
      // Fetch the user's cart from the database
      const userCart = await Cart.findOne({ user }).populate("products.product");
  
      if (!userCart) {
        return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Cart not found"));
      }
  
      const stockUpdates = [];
  
      let total = 0;
  
      for (const cartItem of userCart.products) {
        const product = cartItem.product;
        const quantity = cartItem.quantity;
  
        const price = parseFloat(product.price);
  
        if (isNaN(price) || isNaN(quantity)) {
          console.log("Invalid price or quantity:", price, quantity);
          continue;
        }
  
        if (product.stock < quantity) {
          throw new Error(`Not enough stock for product: ${product.title}`);
        }
  
        stockUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $inc: { stock: -quantity } },
          },
        });
  
        total += price * quantity;
      }
  
      if (isNaN(total)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid total price"));
      }
  
      await Product.bulkWrite(stockUpdates);
      return res.status(HTTP_STATUS.CREATED).send(success("Transaction successfull"));
  
    } catch (error) {
      console.log(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
    }
  }
  
  // async checkOut(req, res) {
  //   try {
  //     const validationErrors = validationResult(req).array();
  //     if (validationErrors.length > 0) {
  //       return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Validation failed", validationErrors));
  //     }
  
  //     const { cart, user } = req.body;
  
  //     // Fetch the user's cart from the database
  //     const userCart = await Cart.findOne({ }).populate("Product");
  
  //     if (!userCart) {
  //       return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Cart not found"));
  //     }
  
  //     const stockUpdates = [];
  
  //     // Calculate the total price and update stock
  //     let total = 0;
  
  //     for (const cartProduct of userCart.products) {
  //       const product = cartProduct.product;
  //       const quantity = cartProduct.quantity;
  
  //       const price = parseFloat(product.price);
  
  //       if (isNaN(price) || isNaN(quantity)) {
  //         console.log("Invalid price or quantity:", price, quantity);
  //         continue;
  //       }
  
  //       if (product.stock < quantity) {
  //         throw new Error(`Not enough stock for product: ${product.title}`);
  //       }
  
  //       stockUpdates.push({
  //         updateOne: {
  //           filter: { _id: product._id },
  //           update: { $inc: { stock: -quantity } },
  //         },
  //       });
  
  //       total += price * quantity;
  //     }
  
  //     if (isNaN(total)) {
  //       return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid total price"));
  //     }
  
  //     await Product.bulkWrite(stockUpdates);
  
  //     // Delete the user's cart after a successful checkout
  //     await userCart.remove();
  
  //     const newTransaction = await TransactionModel.create({ user, products: userCart.products, total });
  
  //     if (newTransaction) {
  //       return res.status(HTTP_STATUS.CREATED).send(success("Transaction created successfully", newTransaction));
  //     } else {
  //       return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Failed to create transaction"));
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
  //   }
  // }
  
  
  
//   async getAll(req, res) {
//     try {
//       let transactions;
//       transactions = await TransactionModel.find({})
//         .populate("user", "-address")
//         .populate("products.product", "-thumbnails"); 

//       if (transactions.length > 0) {
//         return res
//           .status(HTTP_STATUS.OK)
//           .send(success("Successfully received all transactions", { result: transactions, total: transactions.length }));
//       }
//       return res.status(HTTP_STATUS.OK).send(success("No transactions were found"));
//     } catch (error) {
//       console.log(error);
//       return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
//     }
//   }

//   async getById(req, res) {
//     try {
//       const transactionId = req.params.id;

//       const transaction = await TransactionModel.findById(transactionId)
//         .populate("user", "-address")
//         .populate("products.product", "-thumbnails");
  
//       if (!transaction) {
//         return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Transaction not found"));
//       }
  
//       return res.status(HTTP_STATUS.OK).send(success("Transaction retrieved successfully", transaction));
//     } catch (error) {
//       console.log(error);
//       return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
//     }
//   }

// //  async create(req, res) {
// //     try {
// //       const validationErrors = validationResult(req).array();
// //       if (validationErrors.length > 0) {
// //         return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Validation failed", validationErrors));
// //       }
  
// //       const { user, products } = req.body;
  
// //       const productDocuments = await Promise.all(products.map(async (item) => {
// //         const product = await Product.findById(item.product).select("-thumbnails");
        
// //         const price = parseFloat(product.price);
// //         const quantity = parseInt(item.quantity, 10); 
  
// //         if (isNaN(price) || isNaN(quantity)) {
// //           console.log("Invalid price or quantity:", price, quantity);
// //         }
  
// //         return {
// //           product: product._id,
// //           quantity: quantity,
// //           price: price, 
// //         };
// //       }));
  
// //       const total = productDocuments.reduce((acc, item) => {
// //         const productPrice = item.price * item.quantity;
// //         return acc + productPrice;
// //       }, 0);
  
// //       if (isNaN(total)) {
// //         return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid total price"));
// //       }
  
// //       const newTransaction = await TransactionModel.create({ user, products: productDocuments, total });
  
// //       if (newTransaction) {
// //         return res.status(HTTP_STATUS.CREATED).send(success("Transaction created successfully", newTransaction));
// //       } else {
// //         return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Failed to create transaction"));
// //       }
// //     } catch (error) {
// //       console.log(error);
// //       return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
// //     }
// //   }
// async checkOut(req, res) {
//   try {
//     const validationErrors = validationResult(req).array();
//     if (validationErrors.length > 0) {
//       return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Validation failed", validationErrors));
//     }

//     const { cart, user, products } = req.body;

//     const stockUpdates = [];

//     const productDocuments = await Promise.all(products.map(async (item) => {
//       const product = await Product.findById(item.product).select("-thumbnails");

//       const price = parseFloat(product.price);
//       const quantity = parseInt(item.quantity, 10);

//       if (isNaN(price) || isNaN(quantity)) {
//         console.log("Invalid price or quantity:", price, quantity);
//       }

//       const productPrice = price * quantity;

//       if (product.stock < quantity) {
//         throw new Error(`Not enough stock for product: ${product.title}`);
//       }

//       stockUpdates.push({
//         updateOne: {
//           filter: { _id: product._id },
//           update: { $inc: { stock: -quantity } }, 
//         },
//       });

//       return {
//         product: product._id,
//         quantity: quantity,
//         price: productPrice,
//       };
//     }));

//     const total = productDocuments.reduce((acc, item) => {
//       return acc + item.price;
//     }, 0);

//     if (isNaN(total)) {
//       return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid total price"));
//     }

//     await Product.bulkWrite(stockUpdates);

//     const newTransaction = await TransactionModel.create({ user, products: productDocuments, total });

//     if (newTransaction) {
//       return res.status(HTTP_STATUS.CREATED).send(success("Transaction created successfully", newTransaction));
//     } else {
//       return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Failed to create transaction"));
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
//   }
// }
// async addToCart(req, res) {
//     try {
//       const validationErrors = validationResult(req).array();
//       if (validationErrors.length > 0) {
//         return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Validation failed", validationErrors));
//       }
  
//       const { user, products } = req.body;
  
//       const stockUpdates = [];
  
//       const productDocuments = await Promise.all(products.map(async (item) => {
//         const product = await Product.findById(item.product).select("-thumbnails");
  
//         const price = parseFloat(product.price);
//         const quantity = parseInt(item.quantity, 10);
  
//         if (isNaN(price) || isNaN(quantity)) {
//           console.log("Invalid price or quantity:", price, quantity);
//         }
  
//         const productPrice = price * quantity;
  
//         if (product.stock < quantity) {
//           throw new Error(`Not enough stock for product: ${product.title}`);
//         }

//         stockUpdates.push({
//           updateOne: {
//             filter: { _id: product._id },
//             update: { $inc: { stock: -quantity } }, 
//           },
//         });
  
//         return {
//           product: product._id,
//           quantity: quantity,
//           price: productPrice,
//         };
//       }));
  
//       const total = productDocuments.reduce((acc, item) => {
//         return acc + item.price;
//       }, 0);
  
//       if (isNaN(total)) {
//         return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid total price"));
//       }
  
//       await Product.bulkWrite(stockUpdates);
  
//       const newTransaction = await TransactionModel.create({ user, products: productDocuments, total });
  
//       if (newTransaction) {
//         return res.status(HTTP_STATUS.CREATED).send(success("Transaction created successfully", newTransaction));
//       } else {
//         return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Failed to create transaction"));
//       }
//     } catch (error) {
//       console.log(error);
//       return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
//     }
//   }
// async addToCart(req, res) {
//   try {
//     const { productId, quantity } = req.body;
//     const product = await Product.findById(productId).select("-thumbnails");

//     if (!product) {
//       return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Product not found"));
//     }

//     const price = parseFloat(product.price);

//     if (isNaN(price)) {
//       return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid product price"));
//     }

//     const productPrice = price * quantity;

//     if (product.stock < quantity) {
//       return res.status(HTTP_STATUS.BAD_REQUEST).send(failure(`Not enough stock for product: ${product.title}`));
//     }

//     const cartItem = {
//       product: product._id,
//       quantity: quantity,
//       price: productPrice,
//     };

//     // Assuming you have a way to manage the user's cart in your application (e.g., using sessions or tokens),
//     // you can add the cart item to the user's cart.

//     // Example (assuming user is stored in req.user):
//     req.user.cart.push(cartItem);

//     // Save the user's cart to the database or session (depending on your implementation)

//     return res.status(HTTP_STATUS.OK).send(success("Product added to cart successfully", cartItem));
//   } catch (error) {
//     console.log(error);
//     return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
//   }
// }

// Update the quantity of a product in the cart

}

module.exports = new TransactionController();

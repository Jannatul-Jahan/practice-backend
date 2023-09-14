const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const CartModel = require("../model/Cart");
const Product = require("../model/Product");
const HTTP_STATUS = require("../constants/statusCodes");

class CartController {
    async addToCart(req, res) {
        try {
          const validationErrors = validationResult(req).array();
          if (validationErrors.length > 0) {
            return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Validation failed", validationErrors));
          }
      
          const { user, products } = req.body;
      
          // Check if the user already exists in the database
          const existingUser = await CartModel.findOne({ user });
      
          if (existingUser) {
          
            const productDocuments = await Promise.all(products.map(async (item) => {
              const product = await Product.findById(item.product).select("-thumbnails");
          
              const price = parseFloat(product.price);
              const quantity = parseInt(item.quantity, 10);
          
              if (isNaN(price) || isNaN(quantity)) {
                console.log("Invalid price or quantity:", price, quantity);
              }
          
              const productPrice = price * quantity;
              if (product.stock < quantity) {
                throw new Error(`Not enough stock for product: ${product.title}`);
                
              }
          
              const existingProduct = existingUser.products.find(p => p.product.equals(product._id));

              if (existingProduct) {
                
                existingProduct.quantity += quantity;

                return {
                    product: product._id,
                    quantity: existingProduct.quantity,
                    price: productPrice,
                  };
                
                
              } else {
                // Product doesn't exist in the cart, add it
                existingUser.products.push({
                  product: product._id,
                  quantity: quantity,
                  price: productPrice,
                });

                return {
                    product: product._id,
                    quantity: quantity,
                    price: productPrice,
                  };
              }
          
              
            }));
          
            const total = productDocuments.reduce((acc, item) => {
              return acc + item.price;
            }, 0);
          
            if (isNaN(total)) {
              return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid total price"));
            }
          
            existingUser.total += total;
          
            const updatedCart = await existingUser.save();
          
            return res.status(HTTP_STATUS.OK).send(success("Cart updated successfully", updatedCart));
          } else {
      
            const productDocuments = await Promise.all(products.map(async (item) => {
              const product = await Product.findById(item.product).select("-thumbnails");
      
              const price = parseFloat(product.price);
              const quantity = parseInt(item.quantity, 10);
      
              if (isNaN(price) || isNaN(quantity)) {
                console.log("Invalid price or quantity:", price, quantity);
              }
      
              const productPrice = price * quantity;
      
              if (product.stock < quantity) {
                throw new Error(`Not enough stock for product: ${product.title}`);
              }
      
              return {
                product: product._id,
                quantity: quantity,
                price: productPrice,
              };
            }));
      
            const total = productDocuments.reduce((acc, item) => {
              return acc + item.price;
            }, 0);
      
            if (isNaN(total)) {
              return res.status(HTTP_STATUS.BAD_REQUEST).send(failure("Invalid total price"));
            }
      
            // Create a new cart for the user
            const newCart = await CartModel.create({ user, products: productDocuments, total });
      
            return res.status(HTTP_STATUS.CREATED).send(success("Cart created successfully", newCart));
          }
        } catch (error) {
          console.log(error);
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
        }
      }
        
      async removeFromCart(req, res) {
        try {
          const validationErrors = validationResult(req).array();
          if (validationErrors.length > 0) {
            return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Validation failed", validationErrors));
          }
      
          const { user, products } = req.body;
      
          // Check if the user already exists in the database
          const existingUser = await CartModel.findOne({ user });
      
          if (existingUser) {
            // User exists, update the cart
      
            const productDocuments = await Promise.all(products.map(async (item) => {
              const product = await Product.findById(item.product).select("-thumbnails");
      
              const price = parseFloat(product.price);
              const quantity = parseInt(item.quantity, 10);
      
              if (isNaN(price) || isNaN(quantity)) {
                console.log("Invalid price or quantity:", price, quantity);
              }
      
              const productPrice = price * quantity;
      
              if (product.stock < quantity) {
                throw new Error(`Not enough stock for product: ${product.title}`);
              }
      
              // Check if the product already exists in the user's cart
              const existingProduct = existingUser.products.find(p => p.product.equals(product._id));
              
              if (existingProduct) {
                if (existingProduct.quantity < quantity) {
                  
                  console.log("stock is less");
                } else {
                  // Product exists in the cart, update the quantity and price
                  existingProduct.quantity -= quantity;
                  existingUser.total -= productPrice;
                }
              } else {
                console.log("product not found");
              }
      
              return {
                product: product._id,
                quantity: existingProduct.quantity,
                price: existingUser.total, 
              };
            }));
      
            const updatedCart = await existingUser.save();
      
            return res.status(HTTP_STATUS.OK).send(success("Cart updated successfully", updatedCart));
          } else {
            return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Cart not found"));
          }
        } catch (error) {
          console.log(error);
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
        }
      }
      
   

}

module.exports = new CartController();

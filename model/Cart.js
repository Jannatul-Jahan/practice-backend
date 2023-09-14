const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
      },
      products: [{
        product: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      }],
      total: {
        type: Number,
      },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;

const express = require('express');

const Cart = require('../models/cart');
const Product = require("../models/product");
const nodemailer = require('nodemailer');
const { authenticateUser } = require('../middlewares/authenticateUser');

const router = express.Router();

// Middleware for validating request body
const validateRequestBody = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send({ error: 'Request body cannot be empty' });
    }
    
    next();
};

// Add a product to the user's cart
router.post('/add', authenticateUser, validateRequestBody, async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.userId;
      
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send({ error: 'Product not found' });
      }
  
      if (product.quantity < quantity) {
        return res.status(400).send({ error: 'Insufficient product quantity' });
      }
  
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        // If the cart doesn't exist, create a new one
        cart = await Cart.create({
          userId,
          products: [{ productId, quantity }]
        });
      } else {
        // If the cart exists, update it with the new product
        const existingProduct = cart.products.find(
          (product) => product.productId.toString() === productId
        );
  
        if (existingProduct) {
          // If the product already exists in the cart, update the quantity
          existingProduct.quantity += quantity;
        } else {
          // If the product doesn't exist in the cart, add it
          cart.products.push({ productId, quantity });
        }
      }
  
      // Update the product quantity in the product schema
      product.quantity -= quantity;
      await product.save();
  
      await cart.save();
      console.log(userId);
      res.status(201).send(cart);
    } catch (error) {
      console.error(error); 
      res.status(500).send({ error: 'Failed to add product to cart' });
    }
});
  
// Retrieve the user's cart
router.get('/:userId', authenticateUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      'products.productId'
    );
    if (!cart) {
      return res.status(404).send({ error: 'Cart not found' });
    }
    res.send(cart);
  } catch (error) {
    res.status(500).send({ error: 'Failed to retrieve the cart' });
  }
});

// Remove a specific product from the user's cart
// USE PRODUCT ID IN REQ BODY, NOT CART ID
router.delete('/remove', authenticateUser, validateRequestBody, async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.user.userId;

      const cart = await Cart.findOne({ userId });
      
      if (!cart) {
        return res.status(404).send({ error: 'Cart not found' });
      }
  
      const existingProductIndex = cart.products.findIndex(
        (product) => product.productId.toString() === productId
      );
      if (existingProductIndex === -1) {
        return res.status(404).send({ error: 'Product not found in cart' });
      }
  
      const existingProduct = cart.products[existingProductIndex];
  
      // Update the product quantity in the product schema
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send({ error: 'Product not found' });
      }
      product.quantity += existingProduct.quantity;
      await product.save();
  
      // Remove the product from the cart
      cart.products.splice(existingProductIndex, 1);
      await cart.save();
  
      res.status(200).send(cart);
    } catch (error) {
      res.status(500).send({ error: 'Failed to remove product from cart' });
    }
});

// Checkout the user's cart
router.post('/checkout', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        console.log(userId);
        return res.status(404).send({ error: 'Cart not found' });
      }
      
      // Check if the cart is empty
      if (cart.products.length === 0) {
        return res.status(400).send({ error: 'Cart is empty' });
      }
  
      // Clear the cart
      cart.products = [];
      await cart.save();
  
    //   // Send email to the user
    //   var transport = nodemailer.createTransport({
    //     host: "sandbox.smtp.mailtrap.io",
    //     port: 2525,
    //     auth: {
    //       user: "893f9c6a332124",
    //       pass: "fa08ed9435de67"
    //     }
    //   });
  
    //   const mailOptions = {
    //     from: 'ahmadnabeel11@hotmail.com',
    //     to: 'ahmadnabeel11@hotmail.com',
    //     subject: 'Order Confirmation',
    //     text: 'Your order has been successfully placed. Thank you for shopping with us!'
    //   };
  
    //   transport.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         return console.log(error);
    //     }
    //     console.log('Message sent: %s', info.messageId);
    //   });
  
      res.status(200).send({ message: 'Checkout successful' });
    } catch (error) {
      res.status(500).send({ error: 'Failed to process checkout' });
    }
});
  
module.exports = router;

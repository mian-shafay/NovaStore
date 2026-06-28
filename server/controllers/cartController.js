// =============================================
// CART CONTROLLER
// =============================================
// Handles shopping cart operations.
// All endpoints require authentication (user must be logged in).

const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ---- GET CART ----
// Returns the current user's cart with product details populated
const getCart = async (req, res) => {
  try {
    // Find cart for this user, and populate product details for each item
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image stock');

    if (!cart) {
      // If no cart exists yet, return an empty cart
      return res.json({ items: [], totalAmount: 0 });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      if (item.product) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      items: cart.items,
      totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error fetching cart.' });
  }
};

// ---- ADD TO CART ----
// Adds a product to the cart, or increases quantity if already in cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer.' });
    }

    // Verify the product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} items in stock.` });
    }

    // Find or create cart for this user
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create a new cart with this item
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      // Check if product is already in the cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Product exists in cart → check if new total exceeds stock
        const currentQty = cart.items[existingItemIndex].quantity;
        const newQuantity = currentQty + quantity;
        if (newQuantity > product.stock) {
          return res.status(400).json({
            message: `Cannot add more. You already have ${currentQty} in your cart and only ${product.stock} are in stock.`,
          });
        }
        
        // Optimistic locking / Atomic update to prevent race conditions
        const updated = await Cart.findOneAndUpdate(
          { _id: cart._id, 'items.product': productId, 'items.quantity': currentQty },
          { $set: { 'items.$.quantity': newQuantity } },
          { new: true }
        );
        if (!updated) {
          return res.status(409).json({ message: 'Cart was modified concurrently. Please try again.' });
        }
      } else {
        // Product not in cart → add it atomically
        const updated = await Cart.findOneAndUpdate(
          { _id: cart._id, 'items.product': { $ne: productId } },
          { $push: { items: { product: productId, quantity } } },
          { new: true }
        );
        if (!updated) {
          return res.status(409).json({ message: 'Cart was modified concurrently. Please try again.' });
        }
      }
    }

    // Return updated cart with populated product details
    cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image stock');

    const totalAmount = cart.items.reduce((total, item) => {
      if (item.product) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Item added to cart!',
      items: cart.items,
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error adding to cart.' });
  }
};

// ---- UPDATE CART ITEM QUANTITY ----
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    // Find the item in the cart
    const item = cart.items.id(itemId); // Mongoose subdocument method
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    // Check stock
    const product = await Product.findById(item.product);
    if (product && quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items in stock.` });
    }

    item.quantity = quantity;
    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image stock');

    const totalAmount = updatedCart.items.reduce((total, cartItem) => {
      if (cartItem.product) {
        return total + (cartItem.product.price * cartItem.quantity);
      }
      return total;
    }, 0);

    res.json({
      message: 'Cart updated!',
      items: updatedCart.items,
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error updating cart.' });
  }
};

// ---- REMOVE ITEM FROM CART ----
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    // Remove the item using Mongoose's pull method
    cart.items.pull({ _id: itemId });
    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image stock');

    const totalAmount = updatedCart
      ? updatedCart.items.reduce((total, item) => {
          if (item.product) {
            return total + (item.product.price * item.quantity);
          }
          return total;
        }, 0)
      : 0;

    res.json({
      message: 'Item removed from cart!',
      items: updatedCart ? updatedCart.items : [],
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ message: 'Server error removing item.' });
  }
};

// ---- CLEAR ENTIRE CART ----
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared!', items: [], totalAmount: 0 });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error clearing cart.' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

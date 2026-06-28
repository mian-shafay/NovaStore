// =============================================
// PRODUCT CONTROLLER
// =============================================
// Handles CRUD operations for products.
// GET endpoints are public (anyone can browse products).
// POST/PUT/DELETE require admin authentication.

const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const { logAudit } = require('../utils/audit');

// ---- GET ALL PRODUCTS ----
// Supports optional filtering by category and search by name
const getProducts = async (req, res) => {
  try {
    // Build a filter object from query parameters
    // Example: GET /api/products?category=Electronics&search=phone
    const filter = {};

    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      // Use regex for case-insensitive partial matching
      // So searching "phone" matches "iPhone", "Smartphone", etc.
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50); // limit max to 50
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);

    // Find products matching the filter, sorted by newest first
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name'); // Include creator's name

    res.json({
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
};

// ---- GET SINGLE PRODUCT ----
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
};

// ---- CREATE PRODUCT (Admin only) ----
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, image, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image: image || undefined, // Use default if not provided
      stock,
      createdBy: req.user._id,  // Admin's ID from auth middleware
    });

    logAudit({
      actor: req.user._id,
      action: 'PRODUCT_CREATED',
      targetType: 'Product',
      targetId: product._id.toString(),
      metadata: { productName: product.name },
      ip: req.ip,
    });

    res.status(201).json({
      message: 'Product created successfully!',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product.' });
  }
};

// ---- UPDATE PRODUCT (Admin only) ----
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated doc & run validations
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    logAudit({
      actor: req.user._id,
      action: 'PRODUCT_UPDATED',
      targetType: 'Product',
      targetId: product._id.toString(),
      metadata: { productName: product.name },
      ip: req.ip,
    });

    res.json({
      message: 'Product updated successfully!',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product.' });
  }
};

// ---- DELETE PRODUCT (Admin only) ----
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    logAudit({
      actor: req.user._id,
      action: 'PRODUCT_DELETED',
      targetType: 'Product',
      targetId: product._id.toString(),
      metadata: { deletedProductName: product.name },
      ip: req.ip,
    });

    res.json({ message: 'Product deleted successfully!' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

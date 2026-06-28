// =============================================
// PRODUCT ROUTES
// =============================================

const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Validation rules for creating/updating products
const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// Public routes (no auth needed)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only routes (need both auth + adminAuth)
router.post('/', auth, adminAuth, productValidation, createProduct);
router.put('/:id', auth, adminAuth, productValidation, updateProduct);
router.delete('/:id', auth, adminAuth, deleteProduct);

module.exports = router;

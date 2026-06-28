// =============================================
// PRODUCT DETAIL PAGE
// =============================================
// Shows full details of a single product:
// - Large image, name, price, description
// - Stock status indicator
// - Quantity selector
// - Add to Cart button

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiShoppingCart, HiArrowLeft, HiPlus, HiMinus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  // useParams() extracts URL parameters
  // For route "/product/:id", useParams() gives us { id: "..." }
  const { id } = useParams();
  const { user, fetchCartCount } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }
    if (user.role === 'admin') {
      toast.error('Admin accounts cannot add items to cart');
      return;
    }

    setAddingToCart(true);
    try {
      await api.post('/cart', { productId: product._id, quantity });
      toast.success(`${product.name} added to cart!`);
      fetchCartCount();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <h3>Product not found</h3>
            <Link to="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container product-detail">
        {/* Back button */}
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: 'var(--space-xl)' }}>
          <HiArrowLeft /> Back to Products
        </Link>

        <div className="product-detail-grid animate-fadeIn">
          {/* Product Image */}
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <span className="product-detail-category">{product.category}</span>
            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-price">Rs. {product.price.toLocaleString()}</p>
            <p className="product-detail-description">{product.description}</p>

            {/* Stock Status */}
            <div className="product-detail-stock">
              <span className={`stock-dot ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
              <span>
                {product.stock > 0
                  ? `${product.stock} items in stock`
                  : 'Out of stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="quantity-selector">
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Quantity:</span>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <HiMinus />
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                    <HiPlus />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              style={{ marginTop: 'var(--space-md)' }}
            >
              <HiShoppingCart />
              {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

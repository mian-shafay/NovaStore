// =============================================
// PRODUCT CARD COMPONENT
// =============================================
// A reusable card that displays a product's image, name,
// price, and an "Add to Cart" button. Used on the Home page.

import { Link } from 'react-router-dom';
import { HiShoppingCart } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { user, fetchCartCount } = useAuth();

  // Handle adding product to cart
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigating to product detail page
    e.stopPropagation(); // Stop event from bubbling up

    if (!user) {
      toast.error('Please log in to add items to your cart');
      return;
    }

    if (user.role === 'admin') {
      toast.error('Admin accounts cannot add items to cart');
      return;
    }

    try {
      await api.post('/cart', { productId: product._id, quantity: 1 });
      toast.success(`${product.name} added to cart!`);
      fetchCartCount(); // Update the cart badge in navbar
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* Product Image */}
      <div className="product-card-image">
        <img src={product.image} alt={product.name} />
        {/* Category badge */}
        <span className="product-card-badge">{product.category}</span>
      </div>

      {/* Product Info */}
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>

        <h3 className="product-card-name">{product.name}</h3>

        <p className="product-card-price">Rs. {product.price.toLocaleString()}</p>

        <div className="product-card-footer">
          <span className={`product-card-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <HiShoppingCart /> Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

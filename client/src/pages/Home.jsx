// =============================================
// HOME PAGE
// =============================================
// The main landing page with:
// - Hero section with gradient background
// - Search bar for filtering products
// - Category filter buttons
// - Products grid

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiSearch, HiShoppingCart, HiSparkles } from 'react-icons/hi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const location = useLocation();

  // ---- STATE ----
  const [products, setProducts] = useState([]);     // Products from API
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Available categories
  const categories = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Toys'];

  // Scroll to #products section when navigating from another page
  useEffect(() => {
    if (location.hash === '#products') {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  // Reset page to 1 when search or category changes
  useEffect(() => {
    setPage(1);
  }, [search, activeCategory]);

  // ---- FETCH PRODUCTS ----
  // Runs whenever search, category, or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products', {
          params: { category: activeCategory, search, page, limit: 12 }
        });
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce to prevent too many requests while typing
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, activeCategory, page]);

  return (
    <div className="page-wrapper">
      {/* ---- HERO SECTION ---- */}
      <section className="hero">
        <div className="hero-content container animate-slideUp">
          <h1>
            Discover <span className="gradient-text">Premium</span> Products
          </h1>
          <p>
            Shop the latest trends with unbeatable prices and fast delivery.
            Your one-stop destination for everything you need.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              <HiSparkles /> Get Started
            </Link>
            <a href="#products" className="btn btn-secondary btn-lg">
              <HiShoppingCart /> Browse Products
            </a>
          </div>
        </div>
      </section>

      {/* ---- PRODUCTS SECTION ---- */}
      <section id="products" className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <div className="section-header">
          <h2>Our Products</h2>
          <p>Find exactly what you're looking for</p>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <HiSearch className="search-icon" />
          <input
            type="text"
            id="search-products"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  Page {page} of {totalPages}
                </span>
                <button 
                  className="btn btn-secondary" 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try a different search term or category</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

// =============================================
// MANAGE PRODUCTS PAGE (Admin)
// =============================================
// Features:
// - Products table with edit & delete buttons
// - "Add Product" modal with form validation
// - "Edit Product" modal pre-filled with existing data

import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiX, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import AdminNav from '../../components/AdminNav';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Toys', 'Other'];

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image: '',
    stock: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { limit: 1000 } });
      setProducts(res.data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 3)
      newErrors.name = 'Name must be at least 3 characters';
    if (!formData.description.trim() || formData.description.trim().length < 10)
      newErrors.description = 'Description must be at least 10 characters';
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = 'Price must be a positive number';
    if (!formData.category)
      newErrors.category = 'Category is required';
    if (formData.stock === '' || Number(formData.stock) < 0)
      newErrors.stock = 'Stock must be a non-negative number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image || '',
      stock: product.stock.toString(),
    });
    setErrors({});
    setShowModal(true);
  };

  // Save product (create or update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      if (editingProduct) {
        // Update existing product
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success('Product updated!');
      } else {
        // Create new product
        await api.post('/products', payload);
        toast.success('Product created!');
      }

      setShowModal(false);
      fetchProducts(); // Refresh the list
    } catch (error) {
      const msg = error.response?.data?.message
        || error.response?.data?.errors?.[0]?.msg
        || 'Failed to save product';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
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

  return (
    <div className="page-wrapper">
      <div className="container admin-page">
        <AdminNav />
        <div className="admin-page-header">
          <h1>Manage Products</h1>
          <button className="btn btn-primary" onClick={openAddModal}>
            <HiPlus /> Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="data-table-wrapper animate-fadeIn">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {product.name}
                    </td>
                    <td>{product.category}</td>
                    <td style={{ fontWeight: 600 }}>Rs. {product.price.toLocaleString()}</td>
                    <td>
                      <span style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--error)' }}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(product)}
                        >
                          <HiPencil />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="empty-state">
              <h3>No products yet</h3>
              <p>Click "Add Product" to create your first product</p>
            </div>
          )}
        </div>

        {/* ---- MODAL ---- */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <HiX />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Wireless Headphones"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <span className="form-error"><HiExclamationCircle /> {errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe the product (min 10 characters)"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                  {errors.description && <span className="form-error"><HiExclamationCircle /> {errors.description}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (Rs.)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="e.g. 2999"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                    />
                    {errors.price && <span className="form-error"><HiExclamationCircle /> {errors.price}</span>}
                  </div>

                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      name="stock"
                      placeholder="e.g. 50"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                    />
                    {errors.stock && <span className="form-error"><HiExclamationCircle /> {errors.stock}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input
                    type="text"
                    name="image"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;

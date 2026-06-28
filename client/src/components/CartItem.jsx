// =============================================
// CART ITEM COMPONENT
// =============================================
// Displays a single item in the shopping cart.
// Has quantity controls (+/-) and a remove button.

import { HiTrash, HiPlus, HiMinus } from 'react-icons/hi';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  // item.product is populated by the backend with name, price, image, stock

  if (!item.product) return null; // Safety check

  return (
    <div className="cart-item">
      {/* Product Image */}
      <div className="cart-item-image">
        <img src={item.product.image} alt={item.product.name} />
      </div>

      {/* Product Details */}
      <div className="cart-item-details">
        <h4 className="cart-item-name">{item.product.name}</h4>
        <p className="cart-item-price">Rs. {item.product.price.toLocaleString()}</p>
        {item.quantity >= item.product.stock && (
          <p style={{ color: 'var(--warning, #e67e22)', fontSize: '0.8rem', margin: '4px 0 0' }}>
            Max stock reached ({item.product.stock} available)
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="cart-item-actions">
        <div className="quantity-controls">
          <button
            onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <HiMinus />
          </button>
          <span>{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
            title={item.quantity >= item.product.stock ? `Only ${item.product.stock} in stock` : ''}
          >
            <HiPlus />
          </button>
        </div>

        {/* Subtotal */}
        <span style={{ fontWeight: 700, minWidth: '100px', textAlign: 'right' }}>
          Rs. {(item.product.price * item.quantity).toLocaleString()}
        </span>

        {/* Remove Button */}
        <button className="cart-item-remove" onClick={() => onRemove(item._id)}>
          <HiTrash />
        </button>
      </div>
    </div>
  );
};

export default CartItem;

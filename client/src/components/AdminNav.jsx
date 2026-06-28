// =============================================
// ADMIN NAVIGATION COMPONENT
// =============================================
// A sub-navigation bar shown on all admin pages.
// Provides quick links to all admin sections with active state.

import { NavLink } from 'react-router-dom';
import { HiViewGrid, HiCube, HiShoppingBag, HiUsers } from 'react-icons/hi';

const AdminNav = () => {
  return (
    <div className="admin-nav">
      <NavLink
        to="/admin"
        end
        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
      >
        <HiViewGrid /> Dashboard
      </NavLink>
      <NavLink
        to="/admin/products"
        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
      >
        <HiCube /> Products
      </NavLink>
      <NavLink
        to="/admin/orders"
        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
      >
        <HiShoppingBag /> Orders
      </NavLink>
      <NavLink
        to="/admin/users"
        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
      >
        <HiUsers /> Users
      </NavLink>
    </div>
  );
};

export default AdminNav;

import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            🥛 Milk Agency
          </Link>
        </div>

        <ul className={styles.navLinks}>
          <li>
            <Link
              to="/"
              className={isActive('/') ? styles.active : ''}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/brands"
              className={isActive('/brands') ? styles.active : ''}
            >
              Brands
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className={isActive('/products') ? styles.active : ''}
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/customer-types"
              className={isActive('/customer-types') ? styles.active : ''}
            >
              Customer Types
            </Link>
          </li>
          <li>
            <Link
              to="/areas"
              className={isActive('/areas') ? styles.active : ''}
            >
              Areas
            </Link>
          </li>
          <li>
            <Link
              to="/customers"
              className={isActive('/customers') ? styles.active : ''}
            >
              Customers
            </Link>
          </li>
          <li>
            <Link
              to="/pricing"
              className={isActive('/pricing') ? styles.active : ''}
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link
              to="/stock"
              className={isActive('/stock') ? styles.active : ''}
            >
              Stock
            </Link>
          </li>
          <li>
            <Link
              to="/orders"
              className={isActive('/orders') ? styles.active : ''}
            >
              Orders
            </Link>
          </li>
          <li>
            <Link
              to="/orders-list"
              className={isActive('/orders-list') ? styles.active : ''}
            >
              Orders List
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

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
        </ul>
      </div>
    </nav>
  );
}

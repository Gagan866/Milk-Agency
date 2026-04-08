import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const navLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Brands', path: '/brands' },
  { label: 'Products', path: '/products' },
  { label: 'Customer Types', path: '/customer-types' },
  { label: 'Areas', path: '/areas' },
  { label: 'Customers', path: '/customers' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Stock', path: '/stock' },
  { label: 'Orders', path: '/orders' },
  { label: 'Orders List', path: '/orders-list' },
];

export default function Sidebar({ children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.appLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Milk Agency</div>
        <nav className={styles.navSection}>
          <ul className={styles.navList}>
            {navLinks.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
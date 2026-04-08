import { useEffect, useState } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import axiosInstance from '../api/axios';
import styles from './Home.module.css';

export default function Home() {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [brandsResponse, productsResponse] = await Promise.all([
        axiosInstance.get('/brands'),
        axiosInstance.get('/products'),
      ]);

      setBrands(brandsResponse.data);
      setProducts(productsResponse.data);
      console.log('Dashboard Data:', {
        brands: brandsResponse.data,
        products: productsResponse.data,
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Milk Agency Dashboard</h1>
          <button type="button" className={styles.refreshButton} onClick={fetchData}>
            Refresh
          </button>
        </div>
        <p className={styles.subtitle}>
          Manage your milk distribution business efficiently
        </p>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statNumber}>{brands.length}</div>
          <div className={styles.statLabel}>Total Brands</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statNumber}>{products.length}</div>
          <div className={styles.statLabel}>Total Products</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statNumber}>0</div>
          <div className={styles.statLabel}>Total Customers</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statNumber}>0</div>
          <div className={styles.statLabel}>Pending Orders</div>
        </Card>
      </div>

      <div className={styles.featuresSection}>
        <h2>Features</h2>
        <div className={styles.featuresList}>
          <Card className={styles.featureCard}>
            <h3>📦 Manage Brands & Products</h3>
            <p>Create and manage your milk brands and product catalog</p>
          </Card>
          <Card className={styles.featureCard}>
            <h3>👥 Customer Management</h3>
            <p>Track and organize your customers and delivery areas</p>
          </Card>
          <Card className={styles.featureCard}>
            <h3>💰 Pricing Control</h3>
            <p>Set flexible pricing for different customer types</p>
          </Card>
          <Card className={styles.featureCard}>
            <h3>📊 Stock Tracking</h3>
            <p>Monitor inventory with old and new stock balance</p>
          </Card>
        </div>
      </div>

      {loading && <div className={styles.loading}>Loading dashboard...</div>}
      {error && <div className={styles.error}>{error}</div>}
    </Container>
  );
}

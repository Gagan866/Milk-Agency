import { useEffect, useMemo, useState } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import axiosInstance from '../api/axios';
import styles from './Stock.module.css';

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseQuantity = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
};

export default function Stock() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [stockExists, setStockExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0 || !selectedDate) {
      return;
    }

    fetchStockByDate(selectedDate, products);
  }, [selectedDate, products]);

  const initializeStockMap = (productsList, existingMap = {}) => {
    const nextMap = {};

    productsList.forEach((product) => {
      const productId = product.id;
      const existing = existingMap[productId];
      nextMap[productId] = {
        oldQuantity: existing?.oldQuantity ?? '0',
        newQuantity: existing?.newQuantity ?? '0',
      };
    });

    return nextMap;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/products');
      const productsData = response.data || [];
      setProducts(productsData);
      setStockMap(initializeStockMap(productsData));
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
      setLoading(false);
    }
  };

  const fetchStockByDate = async (date, productsList) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/stocks/${date}`);
      const stockItems = response.data?.stockItems || [];

      const fetchedMap = {};
      stockItems.forEach((item) => {
        const productId = item.product?.id ?? item.productId;
        if (!productId) {
          return;
        }

        fetchedMap[productId] = {
          oldQuantity: String(item.oldQuantity ?? 0),
          newQuantity: String(item.newQuantity ?? 0),
        };
      });

      setStockMap(initializeStockMap(productsList, fetchedMap));
      setStockExists(true);
    } catch (err) {
      setStockMap(initializeStockMap(productsList));
      setStockExists(false);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, field, value) => {
    setStockMap((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const rows = useMemo(() => {
    return products.map((product) => {
      const mapEntry = stockMap[product.id] || { oldQuantity: '0', newQuantity: '0' };
      const oldQty = parseQuantity(mapEntry.oldQuantity);
      const newQty = parseQuantity(mapEntry.newQuantity);

      return {
        product,
        oldQuantity: mapEntry.oldQuantity,
        newQuantity: mapEntry.newQuantity,
        total: oldQty + newQty,
      };
    });
  }, [products, stockMap]);

  const groupedProducts = products.reduce((accumulator, product) => {
    const brandName = product.brand?.name || 'Other';

    if (!accumulator[brandName]) {
      accumulator[brandName] = [];
    }

    accumulator[brandName].push(product);
    return accumulator;
  }, {});

  const handleSaveStock = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    const items = products.map((product) => {
      const mapEntry = stockMap[product.id] || { oldQuantity: '0', newQuantity: '0' };

      return {
        productId: product.id,
        oldQuantity: parseQuantity(mapEntry.oldQuantity),
        newQuantity: parseQuantity(mapEntry.newQuantity),
      };
    });

    try {
      setSaving(true);
      setError(null);

      if (stockExists) {
        await axiosInstance.put(`/stocks/${selectedDate}`, { items });
      } else {
        await axiosInstance.post('/stocks', { date: selectedDate, items });
      }

      setStockExists(true);
      await fetchStockByDate(selectedDate, products);
      alert('Stock saved successfully');
    } catch (err) {
      setError('Failed to save stock');
      console.error('Error saving stock:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <div className={styles.header}>
        <h1>Stock Entry</h1>
      </div>

      <Card className={styles.controlCard}>
        <div className={styles.controlRow}>
          <div className={styles.dateWrap}>
            <Input
              label="Stock Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <Button
            className={styles.saveButton}
            variant="primary"
            onClick={handleSaveStock}
            disabled={saving || products.length === 0}
          >
            {saving ? 'Saving...' : stockExists ? 'Update Stock' : 'Save Stock'}
          </Button>
        </div>
      </Card>

      {loading && <div className={styles.loading}>Loading stock data...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && (
        <div className={styles.stockList}>
          {Object.entries(groupedProducts).map(([brand, items]) => (
            <div key={brand} className={styles.brandSection}>
              <h3 className={styles.brandTitle}>{brand}</h3>

              {items.map((product) => {
                const row = rows.find((item) => item.product.id === product.id);

                return (
                  <Card key={product.id} className={styles.stockCard}>
                    <div className={styles.stockRow}>
                      <div className={styles.productCell}>
                        <div className={styles.productInfo}>
                          <strong>{product.name}</strong>
                          <p className={styles.brand}>{product.brand?.name}</p>
                        </div>
                      </div>

                      <div className={styles.inputCell}>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Old"
                          value={row?.oldQuantity ?? ''}
                          onChange={(e) => handleQuantityChange(product.id, 'oldQuantity', e.target.value)}
                        />
                      </div>

                      <div className={styles.inputCell}>
                        <Input
                          type="number"
                          min="0"
                          placeholder="New"
                          value={row?.newQuantity ?? ''}
                          onChange={(e) => handleQuantityChange(product.id, 'newQuantity', e.target.value)}
                        />
                      </div>

                      <div className={styles.totalCell}>{row?.total ?? 0}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className={styles.empty}>
          <p>No products found. Add products first to enter stock.</p>
        </div>
      )}
    </Container>
  );
}

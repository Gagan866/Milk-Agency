import { useEffect, useMemo, useState } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import axiosInstance from '../api/axios';
import styles from './Pricing.module.css';

export default function Pricing() {
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState('');
  const [products, setProducts] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [pricesMap, setPricesMap] = useState({});
  const [existingPrices, setExistingPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCustomerTypeId) {
      setPricesMap({});
      setExistingPrices({});
      return;
    }

    fetchExistingPrices(selectedCustomerTypeId);
  }, [selectedCustomerTypeId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [customerTypesRes, productsRes] = await Promise.all([
        axiosInstance.get('/customer-types'),
        axiosInstance.get('/products'),
      ]);

      setCustomerTypes(customerTypesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError('Failed to load pricing setup data');
      console.error('Error fetching initial pricing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingPrices = async (customerTypeId) => {
    try {
      const pricesRes = await axiosInstance.get('/prices');
      const filtered = pricesRes.data.filter((priceItem) => {
        const itemCustomerTypeId = priceItem.customerType?.id ?? priceItem.customerTypeId;
        return String(itemCustomerTypeId) === String(customerTypeId);
      });

      const nextExistingPrices = {};
      const nextPricesMap = {};

      filtered.forEach((priceItem) => {
        const productId = priceItem.product?.id ?? priceItem.productId;
        if (!productId) {
          return;
        }

        nextExistingPrices[productId] = {
          id: priceItem.id,
          productId,
          price: priceItem.price,
        };
        nextPricesMap[productId] = String(priceItem.price);
      });

      setExistingPrices(nextExistingPrices);
      setPricesMap(nextPricesMap);
    } catch (err) {
      setError('Failed to load existing prices');
      console.error('Error fetching prices:', err);
    }
  };

  const getProductKey = (product) => product.id;

  const handlePriceChange = (productId, value) => {
    setPricesMap((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const saveableProducts = useMemo(() => {
    return products.filter((product) => {
      const value = pricesMap[getProductKey(product)];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
  }, [products, pricesMap]);

  const groupedProducts = products.reduce((accumulator, product) => {
    const brandName = product.brand?.name || 'Other';

    if (!accumulator[brandName]) {
      accumulator[brandName] = [];
    }

    accumulator[brandName].push(product);
    return accumulator;
  }, {});

  const handleSaveAllPrices = async () => {
    if (!selectedCustomerTypeId) {
      setError('Please select a customer type first');
      return;
    }

    if (saveableProducts.length === 0) {
      setError('Please enter at least one price');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess('');

      const requests = saveableProducts.map((product) => {
        const productId = getProductKey(product);
        const rawValue = pricesMap[productId];
        const numericPrice = Number(rawValue);

        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
          return null;
        }

        const payload = {
          productId,
          customerTypeId: Number(selectedCustomerTypeId),
          price: numericPrice,
        };

        const existing = existingPrices[productId];

        if (existing?.id) {
          return axiosInstance.put(`/prices/${existing.id}`, payload);
        }

        return axiosInstance.post('/prices', payload);
      }).filter(Boolean);

      if (requests.length === 0) {
        setError('Please enter valid prices greater than 0');
        return;
      }

      await Promise.all(requests);
      await fetchExistingPrices(selectedCustomerTypeId);
      setSuccess('Prices saved successfully');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError('Failed to save prices');
      console.error('Error saving prices:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <div className={styles.header}>
        <h1>Pricing</h1>
      </div>

      <Card className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.selectWrapper}>
            <label htmlFor="customerTypeSelect" className={styles.label}>
              Customer Type
            </label>
            <select
              id="customerTypeSelect"
              className={styles.select}
              value={selectedCustomerTypeId}
              disabled={saving}
              onChange={(e) => setSelectedCustomerTypeId(e.target.value)}
            >
              <option value="">Select customer type</option>
              {customerTypes.map((customerType) => (
                <option key={customerType.id} value={customerType.id}>
                  {customerType.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            className={styles.saveButton}
            onClick={handleSaveAllPrices}
            disabled={saving || !selectedCustomerTypeId}
          >
            {saving ? 'Saving...' : 'Save All Prices'}
          </Button>
        </div>
      </Card>

      {loading && <div className={styles.loading}>Loading pricing data...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {selectedCustomerTypeId && (
        <div className={styles.pricingList}>
          {Object.entries(groupedProducts).map(([brand, items]) => (
            <div key={brand} className={styles.brandSection}>
              <h3 className={styles.brandTitle}>{brand}</h3>

              {items.map((product) => {
                const productId = getProductKey(product);
                const value = pricesMap[productId] ?? '';

                return (
                  <Card key={productId} className={styles.priceCard}>
                    <div className={styles.itemRow}>
                      <div className={styles.itemInfo}>
                        <div className={styles.productInfo}>
                          <strong>{product.name}</strong>
                          <p className={styles.brand}>{product.brand?.name}</p>
                        </div>
                      </div>
                      <div className={styles.inputWrap}>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter price"
                          value={value}
                          disabled={saving}
                          onChange={(e) => handlePriceChange(productId, e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {!selectedCustomerTypeId && !loading && (
        <div className={styles.empty}>
          <p>Select a customer type to start setting prices.</p>
        </div>
      )}
    </Container>
  );
}

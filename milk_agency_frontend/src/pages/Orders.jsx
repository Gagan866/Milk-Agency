import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import axiosInstance from '../api/axios';
import styles from './Orders.module.css';

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Orders() {
  const location = useLocation();
  const editingOrderId = location.state?.orderId ?? null;
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [prices, setPrices] = useState([]);
  const [quantityMap, setQuantityMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!editingOrderId || customers.length === 0 || products.length === 0) {
      return;
    }

    loadOrderForEdit(editingOrderId);
  }, [editingOrderId, customers, products]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [customersRes, productsRes, pricesRes] = await Promise.all([
        axiosInstance.get('/customers'),
        axiosInstance.get('/products'),
        axiosInstance.get('/prices'),
      ]);

      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
      setPrices(pricesRes.data || []);

      const initialQtyMap = {};
      (productsRes.data || []).forEach((product) => {
        initialQtyMap[product.id] = '';
      });
      setQuantityMap(initialQtyMap);
    } catch (err) {
      setError('Failed to load order data');
      console.error('Error fetching order data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderForEdit = async (orderId) => {
    try {
      setError('');
      const response = await axiosInstance.get(`/orders/${orderId}`);
      const order = response.data;

      const customer = order.customer;
      const customerTypeId = customer?.customerType?.id ?? customer?.customerTypeId;
      const areaId = customer?.area?.id ?? customer?.areaId;

      setSelectedDate(order.date || getTodayDateString());
      setSelectedCustomerTypeId(customerTypeId ? String(customerTypeId) : '');
      setSelectedAreaId(areaId ? String(areaId) : '');
      setSelectedCustomerId(customer?.id ? String(customer.id) : '');

      const initialQtyMap = {};
      products.forEach((product) => {
        initialQtyMap[product.id] = '';
      });

      (order.orderItems || []).forEach((item) => {
        const productId = item.product?.id ?? item.productId;
        if (!productId) {
          return;
        }
        initialQtyMap[productId] = String(item.quantity ?? '');
      });

      setQuantityMap(initialQtyMap);
    } catch (err) {
      setError('Failed to load order for editing');
      console.error('Error loading order:', err);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const customerTypeId = customer.customerType?.id ?? customer.customerTypeId;
      const areaId = customer.area?.id ?? customer.areaId;

      const typeMatch = selectedCustomerTypeId ? String(customerTypeId) === String(selectedCustomerTypeId) : true;
      const areaMatch = selectedAreaId ? String(areaId) === String(selectedAreaId) : true;
      return typeMatch && areaMatch;
    });
  }, [customers, selectedCustomerTypeId, selectedAreaId]);

  const customerTypes = useMemo(() => {
    const map = new Map();
    customers.forEach((customer) => {
      const customerTypeId = customer.customerType?.id ?? customer.customerTypeId;
      const customerTypeName = customer.customerType?.name;
      if (customerTypeId && customerTypeName) {
        map.set(customerTypeId, { id: customerTypeId, name: customerTypeName });
      }
    });
    return Array.from(map.values());
  }, [customers]);

  const areas = useMemo(() => {
    const map = new Map();
    customers.forEach((customer) => {
      const areaId = customer.area?.id ?? customer.areaId;
      const areaName = customer.area?.name;
      if (areaId && areaName) {
        map.set(areaId, { id: areaId, name: areaName });
      }
    });
    return Array.from(map.values());
  }, [customers]);

  const pricesMap = useMemo(() => {
    const map = {};
    if (!selectedCustomerTypeId) {
      return map;
    }

    prices.forEach((priceItem) => {
      const customerTypeId = priceItem.customerType?.id ?? priceItem.customerTypeId;
      if (String(customerTypeId) !== String(selectedCustomerTypeId)) {
        return;
      }

      const productId = priceItem.product?.id ?? priceItem.productId;
      if (!productId) {
        return;
      }

      map[productId] = Number(priceItem.price) || 0;
    });

    return map;
  }, [prices, selectedCustomerTypeId]);

  const lineItems = useMemo(() => {
    return products.map((product) => {
      const qty = Number(quantityMap[product.id] || 0);
      const price = pricesMap[product.id] || 0;
      const total = qty > 0 ? qty * price : 0;

      return {
        product,
        quantity: Number.isFinite(qty) ? qty : 0,
        price,
        total,
      };
    });
  }, [products, quantityMap, pricesMap]);

  const groupedProducts = useMemo(() => {
    return products.reduce((accumulator, product) => {
      const brandName = product.brand?.name || 'Other';

      if (!accumulator[brandName]) {
        accumulator[brandName] = [];
      }

      accumulator[brandName].push(product);
      return accumulator;
    }, {});
  }, [products]);

  const totalAmount = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  }, [lineItems]);

  const handleQuantityChange = (productId, value) => {
    setQuantityMap((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleSaveOrder = async () => {
    if (!selectedCustomerId) {
      setError('Please select customer type, area, and customer');
      return;
    }

    const items = lineItems
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

    if (items.length === 0) {
      setError('Please enter quantity for at least one product');
      return;
    }

    if (!selectedDate) {
      setError('Please select an order date');
      return;
    }

    const payload = {
      date: selectedDate,
      customerId: Number(selectedCustomerId),
      items,
    };

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (editingOrderId) {
        await axiosInstance.put(`/orders/${editingOrderId}`, payload);
      } else {
        await axiosInstance.post('/orders', payload);
      }

      const resetQtyMap = {};
      products.forEach((product) => {
        resetQtyMap[product.id] = '';
      });
      setQuantityMap(resetQtyMap);
      setSuccess(editingOrderId ? 'Order updated successfully' : 'Order saved successfully');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      let message = err.response?.data?.message || 'Failed to save order';
      const match = message.match(/productId\s(\d+)/);

      if (match) {
        const productId = parseInt(match[1], 10);
        const product = products.find((item) => item.id === productId);

        if (product) {
          message = message.replace(
            /Insufficient stock for productId\s\d+/,
            `Insufficient stock for ${product.name} (${product.brand?.name || 'Unknown'})`
          );
        }
      }

      setError(message);
      console.error('Error saving order:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <div className={styles.header}>
        <h1>{editingOrderId ? 'Edit Order' : 'Order Entry'}</h1>
      </div>

      <Card className={styles.filterCard}>
        <div className={styles.dateRow}>
          <label htmlFor="orderDate" className={styles.label}>Date</label>
          <input
            id="orderDate"
            type="date"
            className={styles.dateInput}
            value={selectedDate}
            disabled={saving}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className={styles.filterGrid}>
          <div className={styles.selectWrapper}>
            <label htmlFor="customerTypeSelect" className={styles.label}>Customer Type</label>
            <select
              id="customerTypeSelect"
              className={styles.select}
              value={selectedCustomerTypeId}
              disabled={saving}
              onChange={(e) => {
                setSelectedCustomerTypeId(e.target.value);
                setSelectedCustomerId('');
              }}
            >
              <option value="">Select customer type</option>
              {customerTypes.map((customerType) => (
                <option key={customerType.id} value={customerType.id}>{customerType.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <label htmlFor="areaSelect" className={styles.label}>Area</label>
            <select
              id="areaSelect"
              className={styles.select}
              value={selectedAreaId}
              disabled={saving}
              onChange={(e) => {
                setSelectedAreaId(e.target.value);
                setSelectedCustomerId('');
              }}
            >
              <option value="">Select area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <label htmlFor="customerSelect" className={styles.label}>Customer</label>
            <select
              id="customerSelect"
              className={styles.select}
              value={selectedCustomerId}
              disabled={saving}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Select customer</option>
              {filteredCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading && <div className={styles.loading}>Loading order data...</div>}

      {!loading && (
        <div className={styles.productsList}>
          {Object.entries(groupedProducts).map(([brand, items]) => (
            <div key={brand} className={styles.brandSection}>
              <h3 className={styles.brandTitle}>{brand}</h3>

              {items.map((product) => {
                const item = lineItems.find((entry) => entry.product.id === product.id);

                return (
                  <Card key={product.id} className={styles.productCard}>
                    <div className={styles.row}>
                      <div className={styles.productInfo}>
                        <strong>{product.name}</strong>
                        <p className={styles.brand}>{product.brand?.name}</p>
                      </div>

                      <div className={styles.qtyInputWrap}>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Qty"
                          value={quantityMap[product.id] ?? ''}
                          disabled={saving}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        />
                      </div>

                      <div className={styles.priceCell}>Price: {item?.price.toFixed(2) ?? '0.00'}</div>
                      <div className={styles.totalCell}>Total: {item?.total.toFixed(2) ?? '0.00'}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <Card className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <div className={styles.orderTotal}>Order Total: {totalAmount.toFixed(2)}</div>
            <div className={styles.actionsWrap}>
              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.success}>{success}</p>}
              <Button variant="primary" onClick={handleSaveOrder} disabled={saving || !selectedCustomerId}>
                {saving ? 'Saving...' : editingOrderId ? 'Update Order' : 'Save Order'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </Container>
  );
}

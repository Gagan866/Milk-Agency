import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import axiosInstance from '../api/axios';
import styles from './OrdersList.module.css';

export default function OrdersList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCustomerType, setSelectedCustomerType] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/orders');
      setOrders(response.data || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (orderId) => {
    navigate('/orders', { state: { orderId } });
  };

  const customerTypes = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      const typeId = order.customer?.customerType?.id ?? order.customer?.customerTypeId;
      const typeName = order.customer?.customerType?.name;
      if (typeId && typeName) {
        map.set(String(typeId), typeName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const areas = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      const areaId = order.customer?.area?.id ?? order.customer?.areaId;
      const areaName = order.customer?.area?.name;
      if (areaId && areaName) {
        map.set(String(areaId), areaName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const customers = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      const customerId = order.customer?.id;
      const customerName = order.customer?.name;
      if (customerId && customerName) {
        map.set(String(customerId), customerName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = order.date;
      const orderCustomerTypeId = String(order.customer?.customerType?.id ?? order.customer?.customerTypeId ?? '');
      const orderAreaId = String(order.customer?.area?.id ?? order.customer?.areaId ?? '');
      const orderCustomerId = String(order.customer?.id ?? '');

      const dateMatch = selectedDate ? orderDate === selectedDate : true;
      const customerTypeMatch = selectedCustomerType ? orderCustomerTypeId === selectedCustomerType : true;
      const areaMatch = selectedArea ? orderAreaId === selectedArea : true;
      const customerMatch = selectedCustomer ? orderCustomerId === selectedCustomer : true;

      return dateMatch && customerTypeMatch && areaMatch && customerMatch;
    });
  }, [orders, selectedDate, selectedCustomerType, selectedArea, selectedCustomer]);

  const groupedOrders = useMemo(() => {
    const groupedMap = new Map();

    filteredOrders.forEach((order) => {
      const customerId = order.customer?.id ?? 'unknown';
      const groupKey = `${order.date}__${customerId}`;

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          date: order.date,
          customerId,
          customerName: order.customer?.name || 'N/A',
          customerTypeName: order.customer?.customerType?.name || '',
          areaName: order.customer?.area?.name || '',
          totalAmount: 0,
          editOrderId: order.id,
          itemsMap: new Map(),
        });
      }

      const group = groupedMap.get(groupKey);
      group.totalAmount += Number(order.totalAmount || 0);
      if (order.id > group.editOrderId) {
        group.editOrderId = order.id;
      }

      (order.orderItems || []).forEach((item) => {
        const productId = item.product?.id ?? item.productId;
        if (!productId) {
          return;
        }

        const priceFallback = Number(item.price || 0) * Number(item.quantity || 0);
        const itemTotal = Number(item.total ?? priceFallback ?? 0);
        const current = group.itemsMap.get(productId);

        if (current) {
          current.quantity += Number(item.quantity || 0);
          current.total += itemTotal;
          return;
        }

        group.itemsMap.set(productId, {
          productId,
          name: item.product?.name || `Product #${productId}`,
          brand: item.product?.brand?.name || '',
          quantity: Number(item.quantity || 0),
          total: itemTotal,
        });
      });
    });

    return Array.from(groupedMap.values()).map((group) => ({
      ...group,
      items: Array.from(group.itemsMap.values()),
    }));
  }, [filteredOrders]);

  return (
    <Container>
      <div className={styles.header}>
        <h1>Orders List</h1>
      </div>

      <Card className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.filterField}>
            <label htmlFor="dateFilter" className={styles.label}>Date</label>
            <input
              id="dateFilter"
              type="date"
              className={styles.input}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="customerTypeFilter" className={styles.label}>Customer Type</label>
            <select
              id="customerTypeFilter"
              className={styles.select}
              value={selectedCustomerType}
              onChange={(e) => setSelectedCustomerType(e.target.value)}
            >
              <option value="">All customer types</option>
              {customerTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="areaFilter" className={styles.label}>Area</label>
            <select
              id="areaFilter"
              className={styles.select}
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="">All areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="customerFilter" className={styles.label}>Customer</label>
            <select
              id="customerFilter"
              className={styles.select}
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">All customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading && <div className={styles.loading}>Loading orders...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && (
        <div className={styles.ordersList}>
          {groupedOrders.length > 0 ? (
            groupedOrders.map((group) => (
              <Card key={`${group.date}-${group.customerId}`} className={styles.orderCard}>
                <div className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <div className={styles.meta}>Date: {group.date}</div>
                    <div className={styles.name}>Customer: {group.customerName}</div>
                    <div className={styles.meta}>Type: {group.customerTypeName || 'N/A'}</div>
                    <div className={styles.meta}>Area: {group.areaName || 'N/A'}</div>
                    <div className={styles.itemsBlock}>
                      {group.items.map((item) => (
                        <div key={item.productId} className={styles.itemLine}>
                          <span className={styles.itemProduct}>
                            {item.name}
                            {item.brand ? ` (${item.brand})` : ''}
                          </span>
                          <span className={styles.itemQuantity}>Qty: {item.quantity}</span>
                          <span className={styles.itemTotal}>{item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.total}>Total: {Number(group.totalAmount || 0).toFixed(2)}</div>
                  </div>
                  <Button variant="secondary" className={styles.editButton} onClick={() => handleEdit(group.editOrderId)}>
                    Edit
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className={styles.empty}>
              <p>No orders match the selected filters.</p>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
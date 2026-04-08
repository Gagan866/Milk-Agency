import { useEffect, useState } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import axiosInstance from '../api/axios';
import styles from './Customers.module.css';

export default function Customers() {
  const [name, setName] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [customersRes, customerTypesRes, areasRes] = await Promise.all([
        axiosInstance.get('/customers'),
        axiosInstance.get('/customer-types'),
        axiosInstance.get('/areas'),
      ]);

      setCustomers(customersRes.data);
      setCustomerTypes(customerTypesRes.data);
      setAreas(areasRes.data);
    } catch (err) {
      setError('Failed to load customers data');
      console.error('Error fetching customers data:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSelectedTypeId('');
    setSelectedAreaId('');
    setIsEditMode(false);
    setSelectedId(null);
    setShowForm(false);
  };

  const handleToggleForm = () => {
    if (showForm) {
      resetForm();
      return;
    }

    setShowForm(true);
  };

  const handleSaveCustomer = async () => {
    if (!name.trim() || !selectedTypeId || !selectedAreaId) {
      alert('Please fill all fields');
      return;
    }

    const payload = {
      name,
      customerTypeId: parseInt(selectedTypeId, 10),
      areaId: parseInt(selectedAreaId, 10),
    };

    try {
      if (isEditMode && selectedId) {
        await axiosInstance.put(`/customers/${selectedId}`, payload);
      } else {
        await axiosInstance.post('/customers', payload);
      }

      resetForm();
      fetchData();
    } catch (err) {
      alert(isEditMode ? 'Failed to update customer' : 'Failed to add customer');
      console.error('Error saving customer:', err);
    }
  };

  const handleEditCustomer = (customer) => {
    setName(customer.name || '');
    setSelectedTypeId(String(customer.customerType?.id ?? customer.customerTypeId ?? ''));
    setSelectedAreaId(String(customer.area?.id ?? customer.areaId ?? ''));
    setSelectedId(customer.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  const getCustomerTypeName = (customer) => {
    const typeId = customer.customerType?.id ?? customer.customerTypeId;
    const typeName = customer.customerType?.name;
    if (typeName) {
      return typeName;
    }

    const customerType = customerTypes.find((item) => item.id === typeId);
    return customerType ? customerType.name : 'Unknown';
  };

  const getAreaName = (customer) => {
    const areaId = customer.area?.id ?? customer.areaId;
    const areaName = customer.area?.name;
    if (areaName) {
      return areaName;
    }

    const area = areas.find((item) => item.id === areaId);
    return area ? area.name : 'Unknown';
  };

  return (
    <Container>
      <div className={styles.header}>
        <h1>Customers</h1>
        <Button onClick={handleToggleForm}>
          {showForm ? '✕ Cancel' : '+ Add Customer'}
        </Button>
      </div>

      {showForm && (
        <Card className={styles.formCard}>
          <div className={styles.form}>
            <Input
              label="Customer Name"
              placeholder="Enter customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className={styles.selectWrapper}>
              <label htmlFor="customerTypeSelect" className={styles.label}>
                Customer Type
              </label>
              <select
                id="customerTypeSelect"
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className={styles.select}
              >
                <option value="">Select customer type</option>
                {customerTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.selectWrapper}>
              <label htmlFor="areaSelect" className={styles.label}>
                Area
              </label>
              <select
                id="areaSelect"
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className={styles.select}
              >
                <option value="">Select area</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="primary" onClick={handleSaveCustomer}>
              {isEditMode ? 'Update Customer' : 'Add Customer'}
            </Button>

            {isEditMode && (
              <Button variant="secondary" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </Card>
      )}

      {loading && <div className={styles.loading}>Loading customers...</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.customersList}>
        {customers && customers.length > 0 ? (
          customers.map((customer) => (
            <Card key={customer.id} className={styles.customerCard}>
              <div className={styles.itemRow}>
                <div className={styles.itemDetails}>
                  <span className={styles.name}>{customer.name}</span>
                  <span className={styles.meta}>Type: {getCustomerTypeName(customer)}</span>
                  <span className={styles.meta}>Area: {getAreaName(customer)}</span>
                </div>
                <Button
                  variant="secondary"
                  className={styles.editButton}
                  onClick={() => handleEditCustomer(customer)}
                >
                  Edit
                </Button>
              </div>
              <p className={styles.itemId}>ID: {customer.id}</p>
            </Card>
          ))
        ) : (
          <div className={styles.empty}>
            <p>No customers found. Create one to get started!</p>
          </div>
        )}
      </div>
    </Container>
  );
}

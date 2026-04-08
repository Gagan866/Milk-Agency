import { useEffect, useState } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import axiosInstance from '../api/axios';
import styles from './CustomerTypes.module.css';

export default function CustomerTypes() {
  const [customerTypes, setCustomerTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchCustomerTypes();
  }, []);

  const fetchCustomerTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/customer-types');
      setCustomerTypes(response.data);
    } catch (err) {
      setError('Failed to load customer types');
      console.error('Error fetching customer types:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setShowForm(false);
    setIsEditMode(false);
    setSelectedId(null);
  };

  const handleToggleForm = () => {
    if (showForm) {
      resetForm();
      return;
    }

    setShowForm(true);
  };

  const handleEditCustomerType = (customerType) => {
    setName(customerType.name);
    setSelectedId(customerType.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleSaveCustomerType = async () => {
    if (!name.trim()) {
      alert('Please enter a customer type name');
      return;
    }

    try {
      if (isEditMode && selectedId) {
        await axiosInstance.put(`/customer-types/${selectedId}`, { name });
      } else {
        await axiosInstance.post('/customer-types', { name });
      }

      resetForm();
      fetchCustomerTypes();
    } catch (err) {
      alert(isEditMode ? 'Failed to update customer type' : 'Failed to add customer type');
      console.error('Error saving customer type:', err);
    }
  };

  return (
    <Container>
      <div className={styles.header}>
        <h1>Customer Types</h1>
        <Button onClick={handleToggleForm}>
          {showForm ? '✕ Cancel' : '+ Add Customer Type'}
        </Button>
      </div>

      {showForm && (
        <Card className={styles.formCard}>
          <div className={styles.form}>
            <Input
              label="Customer Type Name"
              placeholder="Enter customer type name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button variant="primary" onClick={handleSaveCustomerType}>
              {isEditMode ? 'Update Customer Type' : 'Add Customer Type'}
            </Button>
            {isEditMode && (
              <Button variant="secondary" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </Card>
      )}

      {loading && <div className={styles.loading}>Loading customer types...</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.customerTypesList}>
        {customerTypes && customerTypes.length > 0 ? (
          customerTypes.map((customerType) => (
            <Card key={customerType.id} className={styles.customerTypeCard}>
              <div className={styles.itemRow}>
                <span className={styles.name}>{customerType.name}</span>
                <Button
                  variant="secondary"
                  className={styles.editButton}
                  onClick={() => handleEditCustomerType(customerType)}
                >
                  Edit
                </Button>
              </div>
              <p className={styles.itemId}>ID: {customerType.id}</p>
            </Card>
          ))
        ) : (
          <div className={styles.empty}>
            <p>No customer types found. Create one to get started!</p>
          </div>
        )}
      </div>
    </Container>
  );
}

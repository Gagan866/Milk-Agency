import { useEffect, useState } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import axiosInstance from '../api/axios';
import styles from './Brands.module.css';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/brands');
      setBrands(response.data);
    } catch (err) {
      setError('Failed to load brands');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewBrandName('');
    setShowAddForm(false);
    setIsEditMode(false);
    setSelectedId(null);
  };

  const handleEditBrand = (brand) => {
    setNewBrandName(brand.name);
    setSelectedId(brand.id);
    setIsEditMode(true);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleToggleForm = () => {
    if (showAddForm) {
      resetForm();
      return;
    }

    setShowAddForm(true);
  };

  const handleSaveBrand = async () => {
    if (!newBrandName.trim()) {
      setError('Please enter a brand name');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess('');

      if (isEditMode && selectedId) {
        await axiosInstance.put(`/brands/${selectedId}`, { name: newBrandName });
      } else {
        await axiosInstance.post('/brands', { name: newBrandName });
      }

      setSuccess(isEditMode ? 'Brand updated successfully' : 'Brand added successfully');
      setTimeout(() => setSuccess(''), 2500);
      resetForm();
      await fetchBrands();
    } catch (err) {
      setError(isEditMode ? 'Failed to update brand' : 'Failed to add brand');
      console.error('Error saving brand:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <div className={styles.header}>
        <h1>Brands</h1>
        <Button onClick={handleToggleForm} disabled={saving}>
          {showAddForm ? '✕ Cancel' : '+ Add Brand'}
        </Button>
      </div>

      {showAddForm && (
        <Card className={styles.formCard}>
          <div className={styles.form}>
            <Input
              label="Brand Name"
              placeholder="Enter brand name"
              value={newBrandName}
              disabled={saving}
              onChange={(e) => setNewBrandName(e.target.value)}
            />
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            <Button variant="primary" onClick={handleSaveBrand} disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Update Brand' : 'Add Brand'}
            </Button>
            {isEditMode && (
              <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                Cancel Edit
              </Button>
            )}
          </div>
        </Card>
      )}

      {loading && <div className={styles.loading}>Loading brands...</div>}
      {!showAddForm && error && <div className={styles.error}>{error}</div>}

      <div className={styles.brandsList}>
        {brands && brands.length > 0 ? (
          brands.map((brand) => (
            <Card key={brand.id} className={styles.brandCard}>
              <div className={styles.itemRow}>
                <span className={styles.name}>{brand.name}</span>
                <Button
                  variant="secondary"
                  className={styles.editButton}
                  onClick={() => handleEditBrand(brand)}
                >
                  Edit
                </Button>
              </div>
              <p className={styles.brandId}>ID: {brand.id}</p>
            </Card>
          ))
        ) : (
          <div className={styles.empty}>
            <p>No brands found. Create one to get started!</p>
          </div>
        )}
      </div>
    </Container>
  );
}

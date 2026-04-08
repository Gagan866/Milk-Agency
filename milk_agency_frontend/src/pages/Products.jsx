import { useEffect, useState } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import axiosInstance from '../api/axios';
import styles from './Products.module.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', brandId: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, brandsRes] = await Promise.all([
        axiosInstance.get('/products'),
        axiosInstance.get('/brands'),
      ]);
      setProducts(productsRes.data);
      setBrands(brandsRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name.trim() || !formData.brandId) {
      setError('Please fill all fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess('');

      const payload = {
        name: formData.name,
        brandId: parseInt(formData.brandId),
      };

      if (isEditMode && selectedId) {
        await axiosInstance.put(`/products/${selectedId}`, payload);
      } else {
        await axiosInstance.post('/products', payload);
      }

      setSuccess(isEditMode ? 'Product updated successfully' : 'Product added successfully');
      setTimeout(() => setSuccess(''), 2500);
      setFormData({ name: '', brandId: '' });
      setShowAddForm(false);
      setIsEditMode(false);
      setSelectedId(null);
      await fetchData();
    } catch (err) {
      setError(isEditMode ? 'Failed to update product' : 'Failed to add product');
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      brandId: product.brand?.id ? String(product.brand.id) : product.brandId ? String(product.brandId) : '',
    });
    setSelectedId(product.id);
    setIsEditMode(true);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', brandId: '' });
    setShowAddForm(false);
    setIsEditMode(false);
    setSelectedId(null);
  };

  const handleToggleForm = () => {
    if (showAddForm) {
      handleCancel();
      return;
    }

    setShowAddForm(true);
  };

  const getBrandName = (product) => {
    const brandId = product.brand?.id ?? product.brandId;
    const brand = brands.find((b) => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  };

  const groupedProducts = products.reduce((accumulator, product) => {
    const brandName = product.brand?.name || 'Other';

    if (!accumulator[brandName]) {
      accumulator[brandName] = [];
    }

    accumulator[brandName].push(product);
    return accumulator;
  }, {});

  return (
    <Container>
      <div className={styles.header}>
        <h1>Products</h1>
        <Button onClick={handleToggleForm} disabled={saving}>
          {showAddForm ? '✕ Cancel' : '+ Add Product'}
        </Button>
      </div>

      {showAddForm && (
        <Card className={styles.formCard}>
          <div className={styles.form}>
            <Input
              label="Product Name"
              placeholder="Enter product name"
              value={formData.name}
              disabled={saving}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className={styles.selectWrapper}>
              <label htmlFor="brandSelect" className={styles.label}>
                Brand
              </label>
              <select
                id="brandSelect"
                value={formData.brandId}
                disabled={saving}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className={styles.select}
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            <Button variant="primary" onClick={handleAddProduct} disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Add Product'}
            </Button>
            {isEditMode && (
              <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                Cancel Edit
              </Button>
            )}
          </div>
        </Card>
      )}

      {loading && <div className={styles.loading}>Loading products...</div>}
      {!showAddForm && error && <div className={styles.error}>{error}</div>}

      <div className={styles.productsList}>
        {products && products.length > 0 ? (
          Object.entries(groupedProducts).map(([brand, items]) => (
            <div key={brand} className={styles.brandSection}>
              <h3 className={styles.brandTitle}>{brand}</h3>

              {items.map((product) => (
                <Card key={product.id} className={styles.productCard}>
                  <div className={styles.itemRow}>
                    <div>
                      <strong className={styles.name}>{product.name}</strong>
                      <p className={styles.brand}>Brand: {getBrandName(product)}</p>
                    </div>
                    <Button
                      variant="secondary"
                      className={styles.editButton}
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </Button>
                  </div>
                  <p className={styles.productId}>ID: {product.id}</p>
                </Card>
              ))}
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <p>No products found. Create one to get started!</p>
          </div>
        )}
      </div>
    </Container>
  );
}

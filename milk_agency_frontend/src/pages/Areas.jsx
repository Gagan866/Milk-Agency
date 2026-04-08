import { useEffect, useState } from 'react';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import axiosInstance from '../api/axios';
import styles from './Areas.module.css';

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/areas');
      setAreas(response.data);
    } catch (err) {
      setError('Failed to load areas');
      console.error('Error fetching areas:', err);
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

  const handleEditArea = (area) => {
    setName(area.name);
    setSelectedId(area.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleSaveArea = async () => {
    if (!name.trim()) {
      setError('Please enter an area name');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess('');

      if (isEditMode && selectedId) {
        await axiosInstance.put(`/areas/${selectedId}`, { name });
      } else {
        await axiosInstance.post('/areas', { name });
      }

      setSuccess(isEditMode ? 'Area updated successfully' : 'Area added successfully');
      setTimeout(() => setSuccess(''), 2500);
      resetForm();
      await fetchAreas();
    } catch (err) {
      setError(isEditMode ? 'Failed to update area' : 'Failed to add area');
      console.error('Error saving area:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <div className={styles.header}>
        <h1>Areas</h1>
        <Button onClick={handleToggleForm} disabled={saving}>
          {showForm ? '✕ Cancel' : '+ Add Area'}
        </Button>
      </div>

      {showForm && (
        <Card className={styles.formCard}>
          <div className={styles.form}>
            <Input
              label="Area Name"
              placeholder="Enter area name"
              value={name}
              disabled={saving}
              onChange={(e) => setName(e.target.value)}
            />
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            <Button variant="primary" onClick={handleSaveArea} disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Update Area' : 'Add Area'}
            </Button>
            {isEditMode && (
              <Button variant="secondary" onClick={resetForm} disabled={saving}>
                Cancel Edit
              </Button>
            )}
          </div>
        </Card>
      )}

      {loading && <div className={styles.loading}>Loading areas...</div>}
      {!showForm && error && <div className={styles.error}>{error}</div>}

      <div className={styles.areasList}>
        {areas && areas.length > 0 ? (
          areas.map((area) => (
            <Card key={area.id} className={styles.areaCard}>
              <div className={styles.itemRow}>
                <span className={styles.name}>{area.name}</span>
                <Button
                  variant="secondary"
                  className={styles.editButton}
                  onClick={() => handleEditArea(area)}
                >
                  Edit
                </Button>
              </div>
              <p className={styles.itemId}>ID: {area.id}</p>
            </Card>
          ))
        ) : (
          <div className={styles.empty}>
            <p>No areas found. Create one to get started!</p>
          </div>
        )}
      </div>
    </Container>
  );
}

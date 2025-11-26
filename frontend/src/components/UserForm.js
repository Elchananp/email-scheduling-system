import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    city: '',
    preferredDay: '',
    sendTimes: [{ time: '09:00', emailType: 1 }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        country: user.country || '',
        city: user.city || '',
        preferredDay: user.preferredDay || '',
        sendTimes: user.sendTimes?.length > 0 
          ? user.sendTimes.map(st => ({ ...st }))
          : [{ time: '09:00', emailType: 1 }],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendTimeChange = (index, field, value) => {
    setFormData(prev => {
      const newSendTimes = [...prev.sendTimes];
      newSendTimes[index] = { ...newSendTimes[index], [field]: field === 'emailType' ? parseInt(value, 10) : value };
      return { ...prev, sendTimes: newSendTimes };
    });
  };

  const addSendTime = () => {
    setFormData(prev => ({
      ...prev,
      sendTimes: [...prev.sendTimes, { time: '09:00', emailType: 1 }],
    }));
  };

  const removeSendTime = (index) => {
    setFormData(prev => ({
      ...prev,
      sendTimes: prev.sendTimes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        // For edit mode, send only the changed fields (excluding email)
        const updateData = {};
        if (formData.firstName !== user.firstName) updateData.firstName = formData.firstName;
        if (formData.lastName !== user.lastName) updateData.lastName = formData.lastName;
        if (formData.country !== user.country || formData.city !== user.city) {
          updateData.country = formData.country;
          updateData.city = formData.city;
        }
        if (formData.preferredDay !== user.preferredDay) {
          updateData.preferredDay = formData.preferredDay || null;
        }
        
        await userService.updateUser(user.email, updateData);
      } else {
        await userService.createUser(formData);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h2 style={styles.formTitle}>{isEditMode ? 'Edit User' : 'Create New User'}</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isEditMode}
            style={{ ...styles.input, ...(isEditMode ? styles.inputDisabled : {}) }}
          />
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Preferred Day</label>
          <select
            name="preferredDay"
            value={formData.preferredDay}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">No preference</option>
            {validDays.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        {!isEditMode && (
          <div style={styles.sendTimesSection}>
            <div style={styles.sendTimesHeader}>
              <label style={styles.label}>Send Times</label>
              <button type="button" onClick={addSendTime} style={styles.addButton}>
                + Add Time
              </button>
            </div>
            {formData.sendTimes.map((sendTime, index) => (
              <div key={index} style={styles.sendTimeRow}>
                <input
                  type="time"
                  value={sendTime.time}
                  onChange={(e) => handleSendTimeChange(index, 'time', e.target.value)}
                  required
                  style={styles.timeInput}
                />
                <select
                  value={sendTime.emailType}
                  onChange={(e) => handleSendTimeChange(index, 'emailType', e.target.value)}
                  style={styles.typeSelect}
                >
                  {[1, 2, 3, 4, 5].map(type => (
                    <option key={type} value={type}>Type {type}</option>
                  ))}
                </select>
                {formData.sendTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSendTime(index)}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {isEditMode && user.sendTimes?.length > 0 && (
          <div style={styles.sendTimesInfo}>
            <label style={styles.label}>Current Send Times</label>
            <div style={styles.sendTimesList}>
              {user.sendTimes.map((st, idx) => (
                <span key={idx} style={styles.sendTimeTag}>
                  {st.time} (Type {st.emailType})
                </span>
              ))}
            </div>
            <p style={styles.infoText}>Send times are managed separately via the Jobs API</p>
          </div>
        )}

        <div style={styles.buttonRow}>
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#555',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#888',
    cursor: 'not-allowed',
  },
  sendTimesSection: {
    marginTop: '8px',
  },
  sendTimesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sendTimeRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '8px',
  },
  timeInput: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  typeSelect: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '100px',
  },
  addButton: {
    padding: '6px 12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  removeButton: {
    padding: '6px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  sendTimesInfo: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  sendTimesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
    marginBottom: '8px',
  },
  sendTimeTag: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '4px',
    fontSize: '12px',
  },
  infoText: {
    fontSize: '12px',
    color: '#666',
    fontStyle: 'italic',
    margin: 0,
  },
};

export default UserForm;

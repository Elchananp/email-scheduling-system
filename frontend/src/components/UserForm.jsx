import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { userService } from '../services/api.js'

const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function UserForm({ user, onSave, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEditMode = !!user

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      country: '',
      city: '',
      preferredDay: '',
      sendTimes: [{ time: '09:00', emailType: 1 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sendTimes'
  })

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        country: user.country || '',
        city: user.city || '',
        preferredDay: user.preferredDay || '',
        sendTimes: user.sendTimes?.length > 0 
          ? user.sendTimes.map(st => ({ time: st.time, emailType: st.emailType }))
          : [{ time: '09:00', emailType: 1 }]
      })
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      if (isEditMode) {
        const updateData = {}
        if (data.firstName !== user.firstName) updateData.firstName = data.firstName
        if (data.lastName !== user.lastName) updateData.lastName = data.lastName
        if (data.country !== user.country || data.city !== user.city) {
          updateData.country = data.country
          updateData.city = data.city
        }
        if (data.preferredDay !== user.preferredDay) {
          updateData.preferredDay = data.preferredDay || null
        }
        
        await userService.updateUser(user.email, updateData)
      } else {
        await userService.createUser(data)
      }
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.formContainer}>
      <h2 style={styles.formTitle}>{isEditMode ? 'Edit User' : 'Create New User'}</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name</label>
            <input
              type="text"
              {...register('firstName', { required: 'First name is required' })}
              style={styles.input}
            />
            {errors.firstName && <span style={styles.fieldError}>{errors.firstName.message}</span>}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name</label>
            <input
              type="text"
              {...register('lastName', { required: 'Last name is required' })}
              style={styles.input}
            />
            {errors.lastName && <span style={styles.fieldError}>{errors.lastName.message}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            disabled={isEditMode}
            style={{ ...styles.input, ...(isEditMode ? styles.inputDisabled : {}) }}
          />
          {errors.email && <span style={styles.fieldError}>{errors.email.message}</span>}
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Country</label>
            <input
              type="text"
              {...register('country', { required: 'Country is required' })}
              style={styles.input}
            />
            {errors.country && <span style={styles.fieldError}>{errors.country.message}</span>}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>City</label>
            <input
              type="text"
              {...register('city', { required: 'City is required' })}
              style={styles.input}
            />
            {errors.city && <span style={styles.fieldError}>{errors.city.message}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Preferred Day</label>
          <select {...register('preferredDay')} style={styles.input}>
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
              <button 
                type="button" 
                onClick={() => append({ time: '09:00', emailType: 1 })} 
                style={styles.addButton}
              >
                + Add Time
              </button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} style={styles.sendTimeRow}>
                <input
                  type="time"
                  {...register(`sendTimes.${index}.time`, { required: true })}
                  style={styles.timeInput}
                />
                <select
                  {...register(`sendTimes.${index}.emailType`, { valueAsNumber: true })}
                  style={styles.typeSelect}
                >
                  {[1, 2, 3, 4, 5].map(type => (
                    <option key={type} value={type}>Type {type}</option>
                  ))}
                </select>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
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
  )
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
  fieldError: {
    color: '#c62828',
    fontSize: '12px',
    marginTop: '4px',
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
}

export default UserForm

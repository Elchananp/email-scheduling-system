import { useState, useEffect } from 'react'
import UserList from './components/UserList.jsx'
import UserForm from './components/UserForm.jsx'
import { userService } from './services/api.js'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data?.users || []);
    } catch (err) {
      setError('Failed to load users. Please check if the backend server is running.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateClick = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (email) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await userService.deleteUser(email);
      await fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleFormSave = async () => {
    setShowForm(false);
    setEditingUser(null);
    await fetchUsers();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📧 Email Scheduling System</h1>
        <p style={styles.subtitle}>Manage users and their email schedules</p>
      </header>

      <main style={styles.main}>
        {error && (
          <div style={styles.errorBanner}>
            {error}
            <button onClick={() => setError('')} style={styles.dismissButton}>×</button>
          </div>
        )}

        <div style={styles.toolbar}>
          <button 
            onClick={handleCreateClick} 
            style={styles.createButton}
            disabled={showForm}
          >
            + Create New User
          </button>
          <button 
            onClick={fetchUsers} 
            style={styles.refreshButton}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {showForm && (
          <UserForm
            user={editingUser}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        )}

        <UserList
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <footer style={styles.footer}>
        <p>Email Scheduling System - React Frontend</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '24px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '600',
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    opacity: 0.9,
  },
  main: {
    flex: 1,
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '24px',
  },
  errorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    color: '#c62828',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  toolbar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  refreshButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  footer: {
    backgroundColor: '#333',
    color: 'white',
    padding: '16px',
    textAlign: 'center',
    fontSize: '12px',
  },
};

export default App;

import React, { useEffect } from 'react';

function UserList({ users, onEdit, onDelete, loading }) {
  // Add keyframes for spinner animation
  useEffect(() => {
    const styleId = 'spinner-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>No users found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div style={styles.listContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Timezone</th>
            <th style={styles.th}>Preferred Day</th>
            <th style={styles.th}>Send Times</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id || user.email} style={styles.tr}>
              <td style={styles.td}>
                {user.firstName} {user.lastName}
              </td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>
                {user.city}, {user.country}
              </td>
              <td style={styles.td}>{user.timezone}</td>
              <td style={styles.td}>{user.preferredDay || 'Any'}</td>
              <td style={styles.td}>
                <div style={styles.sendTimes}>
                  {user.sendTimes?.map((st, idx) => (
                    <span key={idx} style={styles.sendTimeTag}>
                      {st.time} (Type {st.emailType})
                    </span>
                  ))}
                </div>
              </td>
              <td style={styles.td}>
                <div style={styles.actions}>
                  <button
                    onClick={() => onEdit(user)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user.email)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  listContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    color: '#666',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '48px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  emptyText: {
    color: '#666',
    fontSize: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    borderBottom: '2px solid #ddd',
  },
  tr: {
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#555',
  },
  sendTimes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  sendTimeTag: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '4px',
    fontSize: '12px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default UserList;

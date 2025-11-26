const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const userService = {
  // Get all users
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`)
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    return response.json()
  },

  // Get user by email
  getUser: async (email) => {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }
    return response.json()
  },

  // Create a new user
  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create user')
    }
    return response.json()
  },

  // Update user
  updateUser: async (email, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Failed to update user')
    }
    return response.json()
  },

  // Delete user
  deleteUser: async (email) => {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete user')
    }
    return response.json()
  },
}

export const jobService = {
  // Update and add jobs for a user
  updateJobs: async (email, sendTimes) => {
    const response = await fetch(`${API_BASE_URL}/jobs/update-jobs/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sendTimes }),
    })
    if (!response.ok) {
      throw new Error('Failed to update jobs')
    }
    return response.json()
  },
}

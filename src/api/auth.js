const API_URL = process.env.REACT_APP_API_URL || '/api/auth';

export const register = async (name, email, password, avatar) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, avatar }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.msg || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.msg || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUser = async (token) => {
  const res = await fetch(`${API_URL}/user`, {
    method: 'GET',
    headers: {
      'x-auth-token': token,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user data');
  }
  return res.json();
};

export const updateProjects = async (token, projects) => {
  const res = await fetch(`${API_URL}/user-data`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify({ projects }),
  });
  if (!res.ok) {
    throw new Error('Failed to update user data');
  }
  return res.json();
};
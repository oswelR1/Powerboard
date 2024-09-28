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
    
    // Log the raw response
    const rawResponse = await res.text();
    console.log('Raw server response:', rawResponse);
    
    if (!res.ok) {
      throw new Error(rawResponse || 'Registration failed');
    }
    
    // Only parse as JSON if the response is not empty
    return rawResponse ? JSON.parse(rawResponse) : {};
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
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.msg || 'Login failed');
    }
    return res.json();
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
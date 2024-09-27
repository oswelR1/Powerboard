const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/auth'
  : 'http://localhost:5000/api/auth';

export const register = async (name, email, password, avatar) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, avatar }),
  });
  return res.json();
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
    
    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));
    
    const rawResponse = await res.text();
    console.log('Raw response:', rawResponse);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    try {
      return JSON.parse(rawResponse);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return { error: 'Invalid server response', rawResponse };
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: error.message };
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
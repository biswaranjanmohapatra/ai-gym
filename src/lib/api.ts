import { supabase } from './supabase';

const getApiUrl = () => {
  const { hostname, protocol, port } = window.location;
  
  // If we are on a local-like hostname (localhost, 127.0.0.1, or typical LAN IPs)
  const isLocal = hostname === 'localhost' || 
                  hostname === '127.0.0.1' || 
                  hostname.startsWith('192.168.') || 
                  hostname.startsWith('10.') || 
                  hostname.startsWith('172.');
                  
  if (isLocal && port === '8080') {
    return `${protocol}//${hostname}:5000/api`;
  }
  
  // Default fallback for production (Vercel)
  return '/_/backend/api';
};

const API_URL = getApiUrl();

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return response.json();
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
};

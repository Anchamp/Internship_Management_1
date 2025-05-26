import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const verifyJwtToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

// Gets auth headers for fetch requests
export const getAuthHeaders = (): HeadersInit => {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

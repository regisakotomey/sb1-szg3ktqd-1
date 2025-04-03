'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserData, saveUserData } from '@/lib/storage';

interface AuthState {
  user: UserData | null;
  isLoading: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  country: string;
  sector: string;
  email?: string;
  phone?: string;
  password: string;
  anonymousId?: string;
}

interface LoginData {
  login: string;
  password: string;
  anonymousId?: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('mall_user_data');
    if (userData) {
      setState({ 
        user: JSON.parse(userData), 
        isLoading: false 
      });
    } else {
      setState({ user: null, isLoading: false });
    }
  }, []);

  const login = async (credentials: LoginData) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Abonné l'utilisateur à lui meme
      const subs = await fetch(`/api/users/${data.user.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id })
      });
      const subsResp = await subs.json();
      if (!subs.ok) throw new Error(subsResp.error);

      const userData: UserData = {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        country_code: data.user.country_code,
        sector: data.user.sector,
        email: data.user.email,
        phone: data.user.phone,
        isVerified: data.user.isVerified,
        isAnonymous: data.user.isAnonymous
      };

      setState({ user: userData, isLoading: false });
      saveUserData(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Abonné l'utilisateur à lui meme
      const subs = await fetch(`/api/users/${data.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.id })
      });
      const subsResp = await subs.json();
      if (!subs.ok) throw new Error(subsResp.error);

      // Mettre à jour les données du compte anonyme avec les nouvelles informations
      const userData: UserData = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        country_code: data.country_code,
        sector: data.sector,
        email: data.email,
        phone: data.phone,
        isVerified: false,
        isAnonymous: true
      };

      setState({ user: userData, isLoading: false });
      saveUserData(userData);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const verifyCode = async (code: string) => {
    try {
      const userData = state.user;
      if (!userData) throw new Error('Aucun utilisateur trouvé');

      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          userId: userData.id
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const verifiedUserData: UserData = {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        country_code: data.user.country_code,
        sector: data.user.sector,
        email: data.user.email,
        phone: data.user.phone,
        isVerified: data.user.isVerified,
        isAnonymous: data.user.isAnonymous
      };

      setState({ user: verifiedUserData, isLoading: false });
      saveUserData(verifiedUserData);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const resendCode = async () => {
    try {
      const userData = state.user;
      if (!userData) throw new Error('Aucun utilisateur trouvé');

      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${author.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update follow status');
      }

      const data = await response.json();
      
      onPostUpdate({
        postId,
        author: {
          ...author,
          followers: data.followers,
          isFollowed: data.isFollowed
        }
      });
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setState({ user: null, isLoading: false });
    localStorage.removeItem('mall_user_data');
    router.push('/auth/login');
  };

  return {
    user: state.user,
    isAuthenticated: !!state.user,
    isLoading: state.isLoading,
    login,
    register,
    verifyCode,
    resendCode,
    logout
  };
}
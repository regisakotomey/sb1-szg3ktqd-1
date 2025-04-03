export interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  country_code: string;
  sector?: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  isAnonymous: boolean;
}

const USER_DATA_KEY = 'mall_user_data';

export function saveUserData(data: UserData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  }
}

export function getUserData(): UserData | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function hasUserData(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(USER_DATA_KEY);
  }
  return false;
}
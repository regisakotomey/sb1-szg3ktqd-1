import { User } from '@/models/User';
import { connectDB } from './db';

export async function getUserInfo(userId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return null;

    return {
      id: user._id,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : 'Utilisateur',
      avatar: null // TODO: Implement avatar support
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}
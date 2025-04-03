import { connectDB } from './db';
import { User } from '@/models/User';

export async function authenticateUser(login: string, password: string) {
  await connectDB();

  const user = await User.findOne({
    $or: [{ email: login }, { phone: login }]
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new Error('Mot de passe incorrect');
  }

  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
}
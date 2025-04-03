import { User } from '@/models/User';

export async function verifyUserCode(userId: string, code: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  if (!user.verificationCode) {
    throw new Error('Aucun code de vérification trouvé');
  }

  if (user.verificationCode !== code) {
    throw new Error('Code invalide');
  }

  return user;
}

export async function activateUser(user: any) {
  user.isVerified = true;
  user.isAnonymous = false;
  user.verificationCode = undefined;
  await user.save();

  return {
    id: user._id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    country_code: user.country,
    sector: user.sector,
    isVerified: user.isVerified,
    isAnonymous: user.isAnonymous
  };
}
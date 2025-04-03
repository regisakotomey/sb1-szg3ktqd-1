import { sendVerificationEmail } from './mailgun';

export async function sendVerificationCode(destination: string, code: string) {
  if (destination.includes('@')) {
    // C'est un email
    return sendVerificationEmail(destination, code);
  } else {
    // C'est un numéro de téléphone
    // Ici vous implémenteriez l'envoi par SMS
    console.log(`Code de vérification ${code} envoyé au ${destination}`);
    return Promise.resolve();
  }
}
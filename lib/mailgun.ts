import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: "https://api.mailgun.net", // Use EU endpoint if your domain is registered in EU
});

const DOMAIN = process.env.MAILGUN_DOMAIN || '';
const FROM_EMAIL = `verification@${DOMAIN}`;

const htmlContent = (otp: string) => {
  return `
  <!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mail de Vérification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        color: #333;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      h1 {
        text-align: center;
        font-size: 2rem;
        color: #ce8510;
      }
      p {
        font-size: 1rem;
        line-height: 1.5;
        margin: 15px 0;
      }
      .otp-code {
        background-color: rgba(206, 133, 16, 0.2);
        padding: 10px;
        text-align: center;
        font-size: 1.5rem;
        font-weight: bold;
        color: #ce8510;
        border-radius: 8px;
        margin: 20px 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .note {
        font-size: 0.9rem;
        color: #555;
      }
      .highlight {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Mall</h1>
      <p>Le code de vérification de votre compte :</p>
      <div class="otp-code">${otp}</div>
      <p>Veuillez ne jamais partager ce code avec qui que ce soit.</p>
      <p class="note">
        <span class="highlight">Remarque :</span> le code expirera dans 15
        minutes.
      </p>
    </div>
  </body>
</html>
`;
};

export const sendVerificationEmail2 = async (
  email: string,
  otp: string
) => {
  client.messages
    .create("www.dc-localizer.com", {
      from: "mail@dc-localizer.com",
      to: email,
      subject: "Réinitialiser votre mot de passe",
      text: "Vous avez reçu un nouveau code de vérification",
      html: htmlContent(otp),
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => console.error(err)); // logs any error
};

export async function sendVerificationEmail(to: string, code: string) {
  try {
    const messageData = {
      from: "mail@dc-localizer.com",
      to: to,
      subject: 'Vérification de votre compte',
      text: "Vous avez reçu un nouveau code de vérification",
      html: htmlContent(code),
    };

    const response = await client.messages.create(DOMAIN, messageData);
    console.log('Email sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email de vérification');
  }
}
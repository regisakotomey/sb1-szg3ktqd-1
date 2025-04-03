'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function RecoverPasswordPage() {
  const router = useRouter();
  const [useEmail, setUseEmail] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const contact = useEmail ? email : phone;
      
      const res = await fetch('/api/auth/desktop/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Stocker le contact pour la vérification
      localStorage.setItem('recovery_contact', contact);
      
      // Rediriger vers la page de vérification
      router.push('/auth/desktop/recover-password/verify');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Récupération du mot de passe</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Entrez votre email ou numéro de téléphone pour recevoir un code de réinitialisation
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-100 p-1 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setUseEmail(true)}
                className={`p-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  useEmail 
                    ? 'bg-white shadow text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setUseEmail(false)}
                className={`p-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  !useEmail 
                    ? 'bg-white shadow text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Téléphone
              </button>
            </div>
          </div>

          {useEmail ? (
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse email"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          ) : (
            <div className="phone-input-container">
              <PhoneInput
                country={'fr'}
                value={phone}
                onChange={(phone) => setPhone(phone)}
                containerClass="w-full"
                inputClass="w-full pl-10 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                buttonClass="border-0 bg-transparent"
                dropdownClass="shadow-lg text-xs sm:text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 text-xs sm:text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Envoyer le code'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/auth/desktop/login')}
            className="w-full flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
          >
            <ArrowLeft size={16} />
            Retour à la connexion
          </button>
        </form>
      </div>
    </div>
  );
}
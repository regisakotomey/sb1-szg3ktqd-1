'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function MobileRecoverPasswordPage() {
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
      
      const res = await fetch('/api/auth/mobile/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('recovery_contact', contact);
      router.push('/auth/mobile/recover-password/verify');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <div className="flex items-center p-4 border-b border-gray-200">
        <button
          onClick={() => router.push('/auth/mobile/login')}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-semibold ml-2">Récupération du mot de passe</h2>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-6">
          Entrez votre email ou numéro de téléphone pour recevoir un code de réinitialisation
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-100 p-1 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setUseEmail(true)}
                className={`p-2 rounded-md text-sm font-medium transition-colors ${
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
                className={`p-2 rounded-md text-sm font-medium transition-colors ${
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse email"
                className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                inputClass="w-full pl-12 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                buttonClass="border-0 bg-transparent"
                dropdownClass="shadow-lg text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Envoyer le code'}
          </button>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Phone, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import { getUserData } from '@/lib/storage';
import 'react-phone-input-2/lib/style.css';

export default function MobileLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [useEmail, setUseEmail] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginValue = useEmail ? formData.email : formData.phone;
      const anonymousUser = getUserData();
      const anonymousId = anonymousUser?.id;

      await login({ 
        login: loginValue, 
        password: formData.password,
        anonymousId 
      });
      router.push('/');
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
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-md font-semibold ml-2">Connexion</h2>
      </div>
      
      <div className="p-4">
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
                className={`p-2 rounded-sm text-sm font-medium transition-colors ${
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
                className={`p-2 rounded-sm text-sm font-medium transition-colors ${
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
            <div className="relative text-sm">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400  z-10" size={18} />
              <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Adresse email"
              className="w-full pl-10 pr-3 py-3 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
            />
            </div>
          ) : (
            <div className="phone-input-container">
              <PhoneInput
                country={'fr'}
                value={formData.phone}
                onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                containerClass="w-full"
                inputClass="w-full pl-12 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                buttonClass="border-0 bg-transparent"
                dropdownClass="shadow-lg text-sm"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mot de passe"
              className="w-full pl-10 pr-3 py-3 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="text-right">
            <a 
              href="/auth/mobile/recover-password" 
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            )}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Pas encore de compte ?</span>
            {' '}
            <a
              href="/auth/mobile/register"
              className="text-blue-600 hover:text-blue-700"
            >
              S'inscrire
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
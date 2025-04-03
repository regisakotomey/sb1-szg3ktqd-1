'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { getUserData } from '@/lib/storage';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ type: 'email' | 'phone', value: string } | null>(null);
  const router = useRouter();
  const { verifyCode, resendCode } = useAuth();

  useEffect(() => {
    // Récupérer les informations du compte anonyme du localStorage
    const userData = getUserData();
    if (!userData || (!userData.email && userData.phone)) {
      router.push('/auth');
      return;
    }

    if (userData.email) {
      setContactInfo({ type: 'email', value: userData.email });
    } else if (userData.phone) {
      setContactInfo({ type: 'phone', value: userData.phone });
    }
  }, [router]);

  useEffect(() => {
    const timer = timeLeft > 0 && setInterval(() => {
      setTimeLeft(current => current - 1);
    }, 1000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      await verifyCode(code);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Code invalide');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendCode();
      setTimeLeft(60);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    }
  };

  const handleChangeContact = () => {
    router.push('/auth');
  };

  if (!contactInfo) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">Vérification du compte</h2>
        <p className="text-xs sm:text-sm text-gray-600 text-center mb-6">
          Un code de vérification a été envoyé à {contactInfo.type === 'email' ? 'l\'adresse email' : 'votre numéro de téléphone'} :{' '}
          <span className="font-medium text-gray-900">{contactInfo.value}</span>
        </p>

        <button
          onClick={handleChangeContact}
          className="flex items-center justify-center gap-2 w-full mb-6 p-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Changer {contactInfo.type === 'email' ? 'l\'email' : 'le numéro'}</span>
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Entrez le code"
              className="w-full p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={5}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            {isVerifying ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Vérifier'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Vous n'avez pas reçu le code ?
          </p>
          <button
            onClick={handleResendCode}
            disabled={timeLeft > 0}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {timeLeft > 0 
              ? `Renvoyer le code (${timeLeft}s)` 
              : 'Renvoyer le code'}
          </button>
        </div>
      </div>
    </div>
  );
}
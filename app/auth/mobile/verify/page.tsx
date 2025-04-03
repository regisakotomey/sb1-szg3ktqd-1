'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { getUserData } from '@/lib/storage';

export default function MobileVerifyPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ type: 'email' | 'phone', value: string } | null>(null);
  const router = useRouter();
  const { verifyCode, resendCode } = useAuth();

  useEffect(() => {
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
    <div className="min-h-screen w-full bg-white flex flex-col">
      <div className="flex items-center p-4 border-b border-gray-200">
        <button
          onClick={handleChangeContact}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-md font-semibold ml-2">Vérification du compte</h2>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-6">
          Un code de vérification a été envoyé à {contactInfo.type === 'email' ? 'l\'adresse email' : 'votre numéro de téléphone'} :{' '}
          <span className="font-medium text-gray-900">{contactInfo.value}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Entrez le code"
            className="w-full p-3 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
            maxLength={5}
            required
          />

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center gap-2 text-sm"
          >
            {isVerifying ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Vérifier'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Vous n'avez pas reçu le code ?
          </p>
          <button
            onClick={handleResendCode}
            disabled={timeLeft > 0}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
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
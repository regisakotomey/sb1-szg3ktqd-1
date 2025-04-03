'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function VerifyRecoveryCodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Récupérer le contact du localStorage
      const contact = localStorage.getItem('recovery_contact');
      if (!contact) {
        throw new Error('Session expirée');
      }

      const res = await fetch('/api/auth/desktop/recover-password/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          code
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Rediriger vers la page de nouveau mot de passe
      router.push('/auth/desktop/recover-password/reset');
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
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Vérification du code</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Entrez le code reçu par email ou SMS
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code de vérification"
            className="w-full p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 text-xs sm:text-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Vérifier'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/auth/desktop/recover-password')}
            className="w-full flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        </form>
      </div>
    </div>
  );
}
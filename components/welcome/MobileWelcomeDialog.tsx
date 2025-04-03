'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Globe, AlertCircle } from 'lucide-react';
import { countries } from '@/lib/countries';
import { getUserCountry } from '@/lib/geolocation';
import { saveUserData } from '@/lib/storage';

interface MobileWelcomeDialogProps {
  onComplete: () => void;
}

export default function MobileWelcomeDialog({ onComplete }: MobileWelcomeDialogProps) {
  const [detectedCountry, setDetectedCountry] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [isSelectingCountry, setIsSelectingCountry] = useState(false);
  const [detectionFailed, setDetectionFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function detectCountry() {
      try {
        const countryCode = await getUserCountry();
        const country = countries.find(c => c.code === countryCode);
        
        if (country) {
          setDetectedCountry(country.name);
          setSelectedCountryCode(country.code);
          setDetectionFailed(false);
        } else {
          setDetectionFailed(true);
          setIsSelectingCountry(true);
          setSelectedCountryCode(countries[0].code);
        }
      } catch (error) {
        console.error('Error detecting country:', error);
        setDetectionFailed(true);
        setIsSelectingCountry(true);
        setSelectedCountryCode(countries[0].code);
      } finally {
        setIsLoading(false);
      }
    }
    detectCountry();
  }, []);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      const response = await fetch('/api/auth/create-anonymous-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country_code: selectedCountryCode }),
      });

      if (!response.ok) throw new Error('Failed to create user');

      const data = await response.json();
      saveUserData({ 
        id: data.id, 
        country_code: data.country_code,
        isVerified: data.isVerified,
        isAnonymous: data.isAnonymous
      });
      onComplete();
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const dialog = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white w-full h-full flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Bienvenue sur Mall</h2>
                <p className="text-sm text-gray-600">
                  Votre réseau social commercial
                </p>
              </div>
              
              {detectionFailed ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
                    <AlertCircle className="text-yellow-600 flex-shrink-0" size={18} />
                    <p className="text-sm text-yellow-700">
                      Nous n'avons pas pu détecter automatiquement votre pays. 
                      Veuillez en sélectionner un dans la liste ci-dessous.
                    </p>
                  </div>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="w-full p-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-6 text-center">
                    Nous avons détecté que vous êtes {isSelectingCountry ? 'en' : 'au'} :
                  </p>

                  {isSelectingCountry ? (
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="w-full p-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-lg mb-6">
                      <Globe className="text-purple-600" size={18} />
                      <span className="font-medium">{detectedCountry}</span>
                    </div>
                  )}
                </>
              )}

              <div className="mt-auto space-y-3">
                {(!isSelectingCountry && !detectionFailed) && (
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex items-center justify-center gap-2 w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 text-sm"
                  >
                    {isConfirming ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check size={18} />
                        Je confirme
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isSelectingCountry || detectionFailed) {
                      handleConfirm();
                    } else {
                      setIsSelectingCountry(true);
                    }
                  }}
                  disabled={isConfirming}
                  className={`w-full p-4 text-sm ${
                    isSelectingCountry || detectionFailed
                      ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400'
                      : 'border border-gray-300 hover:bg-gray-50'
                  } rounded-lg transition-colors flex items-center justify-center gap-2`}
                >
                  {isConfirming && (isSelectingCountry || detectionFailed) ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    isSelectingCountry || detectionFailed ? 'Confirmer' : 'Choisir un autre pays'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(dialog, document.body);
}
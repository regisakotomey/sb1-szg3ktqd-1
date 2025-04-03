'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Phone, Mail, Lock, User, MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import { countries } from '@/lib/countries';
import { getUserData } from '@/lib/storage';
import { getBusinessSectorsByCategory } from '@/lib/business-sectors';
import 'react-phone-input-2/lib/style.css';

export default function MobileRegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [useEmail, setUseEmail] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    sector: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const businessSectors = getBusinessSectorsByCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.firstName.trim() === "") {
        throw new Error('Le prénom ne peut pas être vide');
      }else if (formData.lastName.trim() === "") {
        throw new Error('Le nom ne peut pas être vide');
      }else if (formData.country.trim() === "") {
        throw new Error('Veuillez sélectionner votre pays');
      }else if (formData.sector.trim() === "") {
        throw new Error('Veuillez sélectionner votre secteur d\'activité');
      }else if (formData.email.trim() === "" && formData.phone.trim() === "") {
        throw new Error('Veuillez renseigner un email ou un numéro de téléphone');
      }else if ((formData.password !== formData.confirmPassword) && formData.password.trim() !== '') {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      const userData = getUserData();
      const anonymousId = userData?.id;

      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        sector: formData.sector,
        email: useEmail ? formData.email : undefined,
        phone: !useEmail ? formData.phone : undefined,
        password: formData.password,
        anonymousId
      };

      await register(registerData);
      router.push('/auth/mobile/verify');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col ">
      <div className="flex items-center p-4 border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-md font-semibold ml-2">Inscription</h2>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Prénom"
                className="w-full pl-10 pr-3 py-3 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Nom"
                className="w-full pl-10 pr-3 py-3 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                required
              />
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
              required
            >
              <option value="">Sélectionnez votre pays</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
            <select
              name="sector"
              value={formData.sector}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
              required
            >
              <option value="">Sélectionnez votre secteur d'activité</option>
              {Object.entries(businessSectors).map(([category, sectors]) => (
                <optgroup key={category} label={category}>
                  {sectors.map(sector => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {useEmail ? (
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Adresse email"
                className="w-full pl-10 pr-3 py-3 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                required
              />
            </div>
          ) : (
            <div className="phone-input-container">
              <PhoneInput
                country={'fr'}
                value={formData.phone}
                onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                containerClass="w-full"
                inputClass="w-full pl-12 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                buttonClass="border-0 bg-transparent"
                dropdownClass="shadow-lg text-sm"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mot de passe"
              className="w-full pl-10 pr-3 py-3 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirmer le mot de passe"
              className="w-full pl-10 pr-3 py-3 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
               required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 text-"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'S\'inscrire'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Déjà un compte ?</span>
            {' '}
            <a
              href="/auth/mobile/login"
              className="text-blue-600 hover:text-blue-700"
            >
              Se connecter
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
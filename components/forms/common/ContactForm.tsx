'use client';

interface ContactFormProps {
  phone: string;
  email: string;
  website: string;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
  onWebsiteChange: (website: string) => void;
  className?: string;
}

export default function ContactForm({
  phone,
  email,
  website,
  onPhoneChange,
  onEmailChange,
  onWebsiteChange,
  className = ''
}: ContactFormProps) {
  return (
    <div className={className}>
      <label className="block text-xs sm:text-sm text-gray-700 mb-4">
        Contact du promoteur *
      </label>
      <div className="space-y-4">
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Numéro de téléphone"
          className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Adresse email"
          className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <input
          type="url"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          placeholder="Site web"
          className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  );
}
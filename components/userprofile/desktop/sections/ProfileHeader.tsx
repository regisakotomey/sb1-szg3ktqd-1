import { Edit, DollarSign, MapPin, Image as ImageIcon, Bell, MessageSquare, Flag, LogOut } from 'lucide-react';
import { UserProfileData } from './types';
import { useRouter } from 'next/navigation';
import { getCountryByCode, countries } from '@/lib/countries';
import { getBusinessSectorLabel, getBusinessSectorsByCategory } from '@/lib/business-sectors';
import { useRef, useState } from 'react';
import ImageEditorDialog from './ImageEditorDialog';
import ImageViewer from '@/components/ui/ImageViewer';

interface ProfileHeaderProps {
  user: UserProfileData;
  isOwnProfile: boolean;
  onSponsor: () => void;
  onFollow: () => void;
  onMessage: () => void;
  onLogout: () => void;
  onReport: () => void;
  isFollowLoading: boolean;
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  onSponsor,
  onFollow,
  onMessage,
  onLogout,
  onReport,
  isFollowLoading
}: ProfileHeaderProps) {
  const router = useRouter();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showCoverEditor, setShowCoverEditor] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState<'avatar' | 'cover' | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    sector: user.sector || '',
    country: user.country_code || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const businessSectors = getBusinessSectorsByCategory();

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatarFile(file);
      setShowAvatarEditor(true);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      setShowCoverEditor(true);
    }
  };

  const handleAvatarSave = async (editedFile: File) => {
    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', editedFile);
      formData.append('userId', user.id);

      const response = await fetch('/api/users/update-avatar', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      const data = await response.json();
      setPreviewAvatar(data.avatar);
      setShowAvatarEditor(false);
      setSelectedAvatarFile(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverSave = async (editedFile: File) => {
    try {
      setIsUploadingCover(true);
      const formData = new FormData();
      formData.append('cover', editedFile);
      formData.append('userId', user.id);

      const response = await fetch('/api/users/update-cover', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update cover');
      }

      const data = await response.json();
      setPreviewCover(data.coverImage);
      setShowCoverEditor(false);
      setSelectedCoverFile(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating cover:', error);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update local state with new user data
      user.firstName = updatedUser.firstName;
      user.lastName = updatedUser.lastName;
      user.sector = updatedUser.sector;
      user.country_code = updatedUser.country_code;

      setShowEditProfile(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {/* Cover Image */}
        <div 
          className="h-[300px] bg-gradient-to-r from-gray-800 to-gray-900 relative cursor-pointer"
        >
          {(previewCover || user.coverImage) && (
            <img
            onClick={() => setShowImagePreview('cover')}
              src={previewCover || user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <>
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverSelect}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  coverInputRef.current?.click();
                }}
                disabled={isUploadingCover}
                className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-lg px-4 py-2 text-sm backdrop-blur-sm transition flex items-center gap-2"
              >
                {isUploadingCover ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ImageIcon size={18} 
                    />
                    Modifier la couverture
                  </>
                )}
              </button>
            </>
          )}
        </div>

        <div className="px-8 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start relative">
            {/* Profile Image */}
            <div className="relative -mt-20">
              <div 
                className="w-32 h-32 rounded-xl overflow-hidden ring-4 ring-white cursor-pointer"
                
              >
                {previewAvatar || user.avatar ? (
                  <img
                  onClick={() => setShowImagePreview('avatar')}
                    src={previewAvatar || user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-4xl font-bold text-gray-400">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      avatarInputRef.current?.click();
                    }}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    {isUploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ImageIcon size={18} />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 pt-4 md:pt-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    {user.firstName} {user.lastName} 
                  </h1>

                  <span className="text-gray-400 text-xl">
                    ({getBusinessSectorLabel(user.sector ?? "unknown")})
                  </span>

                  <p className="flex items-center gap-2 text-gray-600">
                    <span className="font-semibold">Pays :</span> {getCountryByCode(user.country_code)?.name || "Unknown Country"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={onSponsor}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        <DollarSign size={18} />
                        <span>Sponsoriser</span>
                      </button>
                      <button 
                        onClick={() => setShowEditProfile(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                        <span>Modifier</span>
                      </button>
                      <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Déconnexion</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onFollow}
                        disabled={isFollowLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-blue-400"
                      >
                        {isFollowLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Bell size={18} />
                            <span>{user.isFollowed ? 'Se désabonner' : "S'abonner"}</span>
                          </>
                        )}
                      </button>
                      {user.isFollowed && (
                        <button
                          onClick={onMessage}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors"
                        >
                          <MessageSquare size={18} />
                          <span>Message</span>
                        </button>
                      )}
                      <button 
                        onClick={onReport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Flag size={18} />
                        <span>Signaler</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-6 max-w-2xl">{user.bio}</p>

              <div className="flex gap-6 flex-wrap">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-sm text-gray-600">Abonnés</span>
                  <span className="text-lg font-semibold">{user.followers}</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-sm text-gray-600">Abonnements</span>
                  <span className="text-lg font-semibold">{user.following}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Editor Dialogs */}
      {showAvatarEditor && selectedAvatarFile && (
        <ImageEditorDialog
          isOpen={showAvatarEditor}
          onClose={() => {
            setShowAvatarEditor(false);
            setSelectedAvatarFile(null);
          }}
          onSave={handleAvatarSave}
          imageFile={selectedAvatarFile}
          aspectRatio={1/1} // Square aspect ratio for avatar
        />
      )}

      {showCoverEditor && selectedCoverFile && (
        <ImageEditorDialog
          isOpen={showCoverEditor}
          onClose={() => {
            setShowCoverEditor(false);
            setSelectedCoverFile(null);
          }}
          onSave={handleCoverSave}
          imageFile={selectedCoverFile}
          aspectRatio={851/315} // Wide aspect ratio for cover
        />
      )}

      {/* Image Preview */}
      {showImagePreview === 'avatar' && (user.avatar || previewAvatar) && (
        <ImageViewer
          src={previewAvatar || user.avatar}
          alt="Photo de profil"
          onClose={() => setShowImagePreview(null)}
        />
      )}

      {showImagePreview === 'cover' && (user.coverImage || previewCover) && (
        <ImageViewer
          src={previewCover || user.coverImage}
          alt="Photo de couverture"
          onClose={() => setShowImagePreview(null)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Modifier le profil</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <select
                  value={editForm.sector}
                  onChange={(e) => setEditForm(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Sélectionner un secteur</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  value={editForm.country}
                  onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Sélectionner un pays</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={() => setShowEditProfile(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleProfileUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-300"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
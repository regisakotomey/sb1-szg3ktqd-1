// Dimensions
export const dimensions = {
  // Layout
  header: {
    height: '60px',
    mobileHeight: '56px'
  },
  sidebar: {
    width: '250px',
    mobileBottomHeight: '60px'
  },
  mainContent: {
    maxWidth: '600px',
    padding: '1rem'
  },
  rightSidebar: {
    width: '250px'
  },

  // Components
  avatar: {
    small: '32px',
    medium: '40px',
    large: '48px',
    xlarge: '120px'
  },
  image: {
    thumbnail: '80px',
    preview: '200px',
    banner: '400px',
    maxWidth: '1920px'
  },
  button: {
    height: {
      small: '32px',
      medium: '40px',
      large: '48px'
    },
    padding: {
      small: '0.5rem 1rem',
      medium: '0.75rem 1.5rem',
      large: '1rem 2rem'
    }
  },
  input: {
    height: '40px',
    textarea: {
      minHeight: '100px'
    }
  },
  borderRadius: {
    small: '0.375rem',
    medium: '0.5rem',
    large: '0.75rem',
    full: '9999px'
  }
} as const;

// Text content
export const text = {
  // Common
  appName: 'Mall',
  tagline: 'Votre réseau social commercial',
  loading: 'Chargement...',
  error: 'Une erreur est survenue',
  save: 'Enregistrer',
  cancel: 'Annuler',
  delete: 'Supprimer',
  edit: 'Modifier',
  share: 'Partager',
  report: 'Signaler',
  follow: 'Suivre',
  unfollow: 'Ne plus suivre',
  message: 'Message',
  search: 'Rechercher...',
  required: 'Ce champ est requis',

  // Auth
  auth: {
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount: 'Pas encore de compte ?',
    hasAccount: 'Déjà un compte ?',
    verifyAccount: 'Vérifier votre compte',
    verificationCode: 'Code de vérification',
    resendCode: 'Renvoyer le code',
    verificationSent: 'Un nouveau code a été envoyé',
    invalidCode: 'Code invalide'
  },

  // Navigation
  nav: {
    home: 'Accueil',
    events: 'Événements',
    places: 'Lieux',
    opportunities: 'Opportunités',
    marketplace: 'Marketplace',
    shops: 'Boutiques',
    ads: 'Spots publicitaires',
    messages: 'Messages',
    notifications: 'Notifications',
    profile: 'Profil',
    settings: 'Paramètres',
    help: 'Aide',
    contact: 'Contact'
  },

  // Forms
  form: {
    email: 'Adresse email',
    phone: 'Numéro de téléphone',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    country: 'Pays',
    sector: 'Secteur d\'activité',
    title: 'Titre',
    description: 'Description',
    location: 'Localisation',
    date: 'Date',
    time: 'Heure',
    price: 'Prix',
    website: 'Site web',
    invalidEmail: 'Email invalide',
    invalidPhone: 'Numéro de téléphone invalide',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères'
  },

  // Content
  content: {
    create: {
      post: 'Publier une annonce...',
      event: 'Créer un événement',
      place: 'Ajouter un lieu',
      opportunity: 'Créer une opportunité',
      shop: 'Créer une boutique',
      product: 'Ajouter un produit',
      ad: 'Créer un spot publicitaire'
    },
    empty: {
      posts: 'Aucune publication pour le moment',
      events: 'Aucun événement disponible',
      places: 'Aucun lieu disponible',
      opportunities: 'Aucune opportunité disponible',
      shops: 'Aucune boutique disponible',
      products: 'Aucun produit disponible',
      ads: 'Aucun spot publicitaire disponible',
      messages: 'Aucun message',
      notifications: 'Aucune notification',
      search: 'Aucun résultat trouvé'
    },
    actions: {
      like: 'J\'aime',
      comment: 'Commenter',
      share: 'Partager',
      interested: 'Intéressé',
      follow: 'Suivre',
      message: 'Message',
      buy: 'Acheter',
      contact: 'Contacter',
      viewMore: 'Voir plus',
      viewAll: 'Voir tout'
    }
  },

  // Messages
  messages: {
    success: {
      created: 'Créé avec succès',
      updated: 'Mis à jour avec succès',
      deleted: 'Supprimé avec succès'
    },
    error: {
      default: 'Une erreur est survenue',
      network: 'Erreur de connexion',
      auth: 'Erreur d\'authentification',
      validation: 'Veuillez vérifier les champs',
      notFound: 'Non trouvé',
      forbidden: 'Accès non autorisé',
      server: 'Erreur serveur'
    },
    confirm: {
      delete: 'Êtes-vous sûr de vouloir supprimer ?',
      deleteWarning: 'Cette action est irréversible'
    }
  },

  // Report reasons
  reportReasons: [
    { value: 'inappropriate', label: 'Contenu inapproprié' },
    { value: 'spam', label: 'Spam' },
    { value: 'offensive', label: 'Contenu offensant' },
    { value: 'fake', label: 'Fausse information' },
    { value: 'scam', label: 'Arnaque' },
    { value: 'violence', label: 'Violence' },
    { value: 'copyright', label: 'Violation des droits d\'auteur' },
    { value: 'other', label: 'Autre' }
  ]
} as const;

// Media constraints
export const mediaConstraints = {
  image: {
    maxSize: 100 * 1024, // 100 KB
    maxWidth: 1920,
    maxHeight: 1920,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: {
      post: 5,
      event: 5,
      place: 5,
      opportunity: 5,
      shop: 1, // Logo only
      product: 10,
      ad: 10
    }
  },
  video: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    maxDuration: 60, // seconds
    acceptedFormats: ['video/mp4', 'video/webm'],
    maxFiles: {
      post: 1,
      event: 1,
      ad: 5
    }
  }
} as const;

// API endpoints
export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    verify: '/api/auth/verify',
    logout: '/api/auth/logout',
    recoverPassword: '/api/auth/recover-password'
  },
  content: {
    posts: '/api/posts',
    events: '/api/events',
    places: '/api/places',
    opportunities: '/api/opportunities',
    shops: '/api/shops',
    products: '/api/products',
    ads: '/api/ads'
  },
  user: {
    profile: '/api/users',
    follow: '/api/users/follow',
    messages: '/api/messages'
  },
  search: '/api/search'
} as const;
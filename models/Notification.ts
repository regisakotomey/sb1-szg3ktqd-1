import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // ID du destinataire de la notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ID de l'acteur qui a déclenché la notification
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // Type de l'acteur (user ou place)
  actorType: {
    type: String,
    enum: ['user', 'place'],
    required: true
  },

  // Type de l'élément concerné
  contentType: {
    type: String,
    enum: ['event', 'place', 'opportunity', 'shop', 'product', 'post', 'user'],
    required: true
  },

  // ID de l'élément concerné
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // Titre du contenu
  contentTitle: {
    type: String,
    required: true
  },

  // Motif de la notification
  reason: {
    type: String,
    enum: [
      'new_content',      // Nouvel ajout d'élément
      'content_updated',  // Élément modifié
      'content_deleted',  // Élément supprimé
      'content_followed', // Élément suivi
      'user_followed',
      'content_liked',    // Élément aimé
      'content_commented' // Élément commenté
    ],
    required: true
  },

  // URL de l'image associée (si applicable)
  imageUrl: String,

  // Lien de redirection
  link: {
    type: String,
    required: true
  },

  // État de lecture
  read: {
    type: Boolean,
    default: false
  },

  // Date de lecture
  readAt: {
    type: Date
  },

  // État de suppression
  isDeleted: {
    type: Boolean,
    default: false
  },

  // Date de suppression
  deletedAt: {
    type: Date
  },

  // Date de création
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour améliorer les performances des requêtes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ contentType: 1, contentId: 1 });
notificationSchema.index({ isDeleted: 1 });
notificationSchema.index({ read: 1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
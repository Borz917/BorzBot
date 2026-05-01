module.exports = {
  staffRoleName: 'Équipe STAFF',

  ticketSubjects: [
    { id: 'boutique', label: 'Questions/Réclamations Boutique ?' },
    { id: 'support', label: 'Support Général' },
    { id: 'recrutement', label: 'Recrutement Equipe LA STORY' },
    { id: 'illegal', label: 'Pôle illégal' },
    { id: 'legal', label: 'Pôle légal' },
    { id: 'unban', label: 'Demande unban' },
    { id: 'fonda', label: 'Contacte fonda' },
    { id: 'plainte_staff', label: 'Plainte STAFF' }
  ],

  ticketCategoryBySubject: {
    boutique: '📦・boutique',
    support: '🛠️・support',
    recrutement: '👥・recrutement-staff',
    illegal: '🔫・illegal',
    legal: '⚖️・legal',
    unban: '🔓・unban',
    fonda: '👑・fonda',
    plainte_staff: '🚨・plainte-staff'
  },

  ticketLogChannelsBySubject: {
    boutique: 'questions-boutique-logs',
    support: 'support-general-logs',
    recrutement: 'recrutement-equipe-logs',
    illegal: 'pole-illegal-logs',
    legal: 'pole-legal-logs',
    unban: 'demande-unban-logs',
    fonda: 'contact-fonda-logs',
    plainte_staff: 'plainte-staff-logs'
  },

  defaultLogsChannelName: 'ticket-logs'
};
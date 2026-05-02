const {
  Events,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const { getUserInvites, getGuildInvites } = require('../utils/inviteStore');
const { getActiveGiveaways } = require('../utils/giveawayStore');

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

const createTranscript = require('../utils/createTranscript');

const {
  getDuel,
  updateDuel,
  deleteDuel,
  addWin
} = require('../utils/duelStore');

const ticketConfig = require('../config/ticketConfig');
const notifConfig = require('../config/notifRoles');

const {
  getTicket,
  setTicket,
  deleteTicket,
  findTicketByChannelId
} = require('../utils/ticketStore');

const sendTicketLog = require('../utils/sendTicketLog');

function buildClaimButtonLabel(count) {
  if (count <= 0) return 'Prendre en charge';
  if (count === 1) return 'Repris par 1 staff';
  return `Repris par ${count} staff`;
}

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    try {
      if (interaction.isStringSelectMenu()) {

        if (interaction.customId === 'invite_panel_menu') {
          const selected = interaction.values[0];

          if (selected === 'top15') {
            const guildData = getGuildInvites(interaction.guild.id);

            const leaderboard = Object.entries(guildData)
              .sort(([, a], [, b]) => b.total - a.total)
              .slice(0, 15);

            if (leaderboard.length === 0) {
              return interaction.reply({
                content: '📨 Aucun invite log enregistré pour le moment.',
                ephemeral: true
              });
            }

            const text = leaderboard
              .map(([userId, data], index) => {
                const medal =
                  index === 0 ? '🥇' :
                    index === 1 ? '🥈' :
                      index === 2 ? '🥉' :
                        `#${index + 1}`;

                return `${medal} <@${userId}> — **${data.total} invitation(s)**`;
              })
              .join('\n');

            const embed = new EmbedBuilder()
              .setTitle('🏆 Top 15 Invitations')
              .setDescription(text)
              .setColor(0xfaa61a)
              .setTimestamp();

            return interaction.reply({
              embeds: [embed],
              ephemeral: true
            });
          }

          if (selected === 'myinvites') {
            const data = getUserInvites(interaction.guild.id, interaction.user.id);

            const embed = new EmbedBuilder()
              .setTitle('📨 Mes invitations')
              .setDescription(
                `**Membre :** ${interaction.user}\n` +
                `**Invitations confirmées :** ${data.total}\n\n` +
                `**Personnes invitées :**\n` +
                `${data.users.length > 0 ? data.users.map(id => `• <@${id}>`).join('\n') : 'Aucune'}`
              )
              .setColor(0x5865f2)
              .setTimestamp();

            return interaction.reply({
              embeds: [embed],
              ephemeral: true
            });
          }

          if (selected === 'giveaways') {
            const giveaways = getActiveGiveaways(interaction.guild.id);

            if (giveaways.length === 0) {
              return interaction.reply({
                content: '🎁 Aucun giveaway en cours pour le moment.',
                ephemeral: true
              });
            }

            const userInvites = getUserInvites(interaction.guild.id, interaction.user.id);

            const text = giveaways
              .map(g => {
                const canEnter = userInvites.total >= g.invitesRequired;

                return (
                  `🎁 **${g.name}**\n` +
                  `**Récompense :** ${g.reward}\n` +
                  `**Invitations nécessaires :** ${g.invitesRequired}\n` +
                  `**Ton total :** ${userInvites.total}\n` +
                  `**Statut :** ${canEnter ? '✅ Éligible' : '❌ Pas assez d’invitations'}\n` +
                  `**ID :** \`${g.id}\``
                );
              })
              .join('\n\n━━━━━━━━━━━━━━\n\n');

            const embed = new EmbedBuilder()
              .setTitle('🎁 Giveaways en cours')
              .setDescription(text)
              .setColor(0x57f287)
              .setTimestamp();

            return interaction.reply({
              embeds: [embed],
              ephemeral: true
            });
          }
        }
        if (interaction.customId !== 'ticket_create_menu') return;

        const existingTicket = getTicket(interaction.user.id);
        if (existingTicket?.channelId) {
          return interaction.reply({
            content: `❌ Tu as déjà un ticket ouvert : <#${existingTicket.channelId}>`,
            ephemeral: true
          });
        }

        const subjectId = interaction.values[0];
        const subject = ticketConfig.ticketSubjects.find(s => s.id === subjectId);
        if (!subject) {
          return interaction.reply({ content: '❌ Sujet invalide.', ephemeral: true });
        }

        const categoryName = ticketConfig.ticketCategoryBySubject[subject.id];
        if (!categoryName) {
          return interaction.reply({
            content: `❌ Aucune catégorie configurée pour le sujet : ${subject.label}`,
            ephemeral: true
          });
        }

        const category = interaction.guild.channels.cache.find(
          c => c.name === categoryName && c.type === ChannelType.GuildCategory
        );

        if (!category) {
          return interaction.reply({
            content: `❌ Catégorie introuvable : ${categoryName}`,
            ephemeral: true
          });
        }

        const staffRole = interaction.guild.roles.cache.find(
          r => r.name === ticketConfig.staffRoleName
        );

        const safeName = (interaction.user.username || interaction.user.id)
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, '')
          .slice(0, 12);

        const channel = await interaction.guild.channels.create({
          name: `${subject.id}-${safeName}`,
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles
              ]
            },
            {
              id: interaction.guild.members.me.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.ManageMessages
              ]
            },
            ...(staffRole
              ? [{
                id: staffRole.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory
                ]
              }]
              : [])
          ]
        });

        setTicket(interaction.user.id, {
          channelId: channel.id,
          subject: subject.label,
          subjectId: subject.id,
          claimedBy: []
        });

        const embed = new EmbedBuilder()
          .setTitle('🎫 Ticket ouvert')
          .setDescription(
            `**Utilisateur :** ${interaction.user}\n` +
            `**Sujet :** ${subject.label}\n` +
            `**Catégorie :** ${categoryName}\n` +
            `**Statut :** En attente\n` +
            `**Équipe STAFF en charge :** Personne\n\n` +
            `Explique ta demande dans ce salon.`
          )
          .setColor(0x5865f2)
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_claim_button')
            .setLabel(buildClaimButtonLabel(0))
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('ticket_close_button')
            .setLabel('Fermer le ticket')
            .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
          content: `${interaction.user}${staffRole ? ` <@&${staffRole.id}>` : ''}`,
          embeds: [embed],
          components: [row]
        });

        await sendTicketLog(
          interaction.guild,
          subject.id,
          '🎫 Ticket ouvert',
          `**Utilisateur :** ${interaction.user}\n**Sujet :** ${subject.label}\n**Catégorie :** ${categoryName}\n**Salon :** ${channel}`,
          0x57f287
        );

        return interaction.reply({
          content: `✅ Ton ticket a été créé : ${channel}`,
          ephemeral: true
        });
      }

      if (interaction.isButton()) {
        if (interaction.customId?.startsWith('duel_decline_')) {
          const duelId = interaction.customId.replace('duel_decline_', '');
          const duel = getDuel(duelId);

          if (!duel) return interaction.reply({ content: '❌ Duel introuvable.', ephemeral: true });
          if (interaction.user.id !== duel.opponentId) {
            return interaction.reply({ content: '❌ Ce duel n’est pas pour toi.', ephemeral: true });
          }

          deleteDuel(duelId);

          return interaction.update({
            content: '❌ Duel refusé.',
            embeds: [],
            components: []
          });
        }

        if (interaction.customId?.startsWith('duel_accept_')) {
          const duelId = interaction.customId.replace('duel_accept_', '');
          const duel = getDuel(duelId);

          if (!duel) return interaction.reply({ content: '❌ Duel introuvable.', ephemeral: true });
          if (interaction.user.id !== duel.opponentId) {
            return interaction.reply({ content: '❌ Ce duel n’est pas pour toi.', ephemeral: true });
          }

          duel.status = 'playing';
          updateDuel(duelId, duel);

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`duel_choice_${duelId}_pierre`)
              .setLabel('Pierre')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId(`duel_choice_${duelId}_feuille`)
              .setLabel('Feuille')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId(`duel_choice_${duelId}_ciseaux`)
              .setLabel('Ciseaux')
              .setStyle(ButtonStyle.Secondary)
          );

          return interaction.update({
            content: `<@${duel.challengerId}> <@${duel.opponentId}>`,
            embeds: [
              new EmbedBuilder()
                .setTitle('⚔️ Duel lancé')
                .setDescription(
                  `**Mode :** ${duel.mode === 'ranked' ? 'Ranked 🏆' : 'Fun 🎮'}\n\n` +
                  `Les deux joueurs doivent choisir.`
                )
                .setColor(0x5865f2)
            ],
            components: [row]
          });
        }

        if (interaction.customId?.startsWith('duel_choice_')) {
          const parts = interaction.customId.split('_');
          const choice = parts.pop();
          const duelId = parts.slice(2).join('_');
          const duel = getDuel(duelId);

          if (!duel) return interaction.reply({ content: '❌ Duel introuvable.', ephemeral: true });
          if (![duel.challengerId, duel.opponentId].includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ Tu ne participes pas à ce duel.', ephemeral: true });
          }

          if (!duel.choices) duel.choices = {};

          if (duel.choices[interaction.user.id]) {
            return interaction.reply({ content: '❌ Tu as déjà choisi.', ephemeral: true });
          }

          duel.choices[interaction.user.id] = choice;
          updateDuel(duelId, duel);

          const challengerChoice = duel.choices[duel.challengerId];
          const opponentChoice = duel.choices[duel.opponentId];

          if (!challengerChoice || !opponentChoice) {
            return interaction.reply({
              content: `✅ Choix enregistré : **${choice}**. En attente de l’autre joueur.`,
              ephemeral: true
            });
          }

          let resultText = 'Égalité 😐';
          let winnerId = null;
          let loserId = null;

          if (challengerChoice !== opponentChoice) {
            const challengerWins =
              (challengerChoice === 'pierre' && opponentChoice === 'ciseaux') ||
              (challengerChoice === 'feuille' && opponentChoice === 'pierre') ||
              (challengerChoice === 'ciseaux' && opponentChoice === 'feuille');

            winnerId = challengerWins ? duel.challengerId : duel.opponentId;
            loserId = challengerWins ? duel.opponentId : duel.challengerId;
            resultText = `<@${winnerId}> gagne 🎉`;
          }

          if (winnerId && duel.mode === 'ranked') {
            addWin(winnerId, loserId);
          }

          deleteDuel(duelId);

          return interaction.update({
            embeds: [
              new EmbedBuilder()
                .setTitle('🏁 Résultat du duel')
                .setDescription(
                  `**<@${duel.challengerId}> :** ${challengerChoice}\n` +
                  `**<@${duel.opponentId}> :** ${opponentChoice}\n\n` +
                  `**Résultat :** ${resultText}` +
                  `${duel.mode === 'ranked' && winnerId ? '\n\n🏆 Ranked : +25 / -15' : ''}`
                )
                .setColor(winnerId ? 0x57f287 : 0x99aab5)
                .setTimestamp()
            ],
            components: []
          });
        }

        if (interaction.isModalSubmit()) {
          if (!interaction.customId.startsWith('ticket_close_modal_')) return;

          // 🔥 IMPORTANT : évite l'erreur Discord
          await interaction.deferReply({ ephemeral: true });

          try {
            const channelId = interaction.customId.replace('ticket_close_modal_', '');
            const channel = interaction.guild.channels.cache.get(channelId);

            if (!channel) {
              return interaction.editReply({
                content: '❌ Salon introuvable.'
              });
            }

            const ticketData = findTicketByChannelId(channel.id);

            if (!ticketData) {
              return interaction.editReply({
                content: '❌ Ce salon n’est pas un ticket.'
              });
            }

            const reason = interaction.fields.getTextInputValue('close_reason');

            const claimedMentions =
              Array.isArray(ticketData.claimedBy) && ticketData.claimedBy.length > 0
                ? ticketData.claimedBy.map(id => `<@${id}>`).join(', ')
                : 'Personne';

            // 🔥 Sécurité transcript
            let transcript = null;
            try {
              transcript = await createTranscript(channel);
            } catch (e) {
              console.error('Erreur transcript :', e);
            }

            deleteTicket(ticketData.userId);

            await sendTicketLog(
              interaction.guild,
              ticketData.subjectId,
              '🔒 Ticket fermé',
              `**Utilisateur :** <@${ticketData.userId}>\n` +
              `**Sujet :** ${ticketData.subject}\n` +
              `**Pris en charge par :** ${claimedMentions}\n` +
              `**Fermé par :** ${interaction.user}\n` +
              `**Raison :** ${reason}\n` +
              `**Salon :** #${channel.name}`,
              0xed4245,
              transcript ? [transcript] : []
            );

            await interaction.editReply({
              content: '✅ Ticket fermé + transcript envoyé.'
            });

            setTimeout(async () => {
              await channel.delete().catch(() => null);
            }, 2000);

          } catch (error) {
            console.error('❌ Erreur fermeture ticket :', error);

            await interaction.editReply({
              content: '❌ Une erreur est survenue lors de la fermeture.'
            });
          }
        }
        if (interaction.customId?.startsWith('notif_role_')) {
          const roleId = interaction.customId.replace('notif_role_', '');
          const roleData = notifConfig.roles.find(r => r.id === roleId);

          if (!roleData) {
            return interaction.reply({ content: '❌ Rôle notification introuvable.', ephemeral: true });
          }

          const role = interaction.guild.roles.cache.find(r => r.name === roleData.roleName);

          if (!role) {
            return interaction.reply({
              content: `❌ Le rôle **${roleData.roleName}** n’existe pas sur le serveur.`,
              ephemeral: true
            });
          }

          if (!role.editable) {
            return interaction.reply({
              content: `❌ Je ne peux pas gérer le rôle ${role}. Mets le rôle du bot au-dessus.`,
              ephemeral: true
            });
          }

          if (interaction.member.roles.cache.has(role.id)) {
            await interaction.member.roles.remove(role);
            return interaction.reply({ content: `❌ Rôle retiré : ${role}`, ephemeral: true });
          }

          await interaction.member.roles.add(role);
          return interaction.reply({ content: `✅ Rôle ajouté : ${role}`, ephemeral: true });
        }

        if (interaction.customId === 'ticket_claim_button') {
          const ticketData = findTicketByChannelId(interaction.channel.id);

          if (!ticketData) {
            return interaction.reply({ content: '❌ Ce salon n’est pas un ticket.', ephemeral: true });
          }

          const staffRole = interaction.guild.roles.cache.find(
            r => r.name === ticketConfig.staffRoleName
          );

          const hasStaffRole = staffRole && interaction.member.roles.cache.has(staffRole.id);
          const canManage = interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels);

          if (!hasStaffRole && !canManage) {
            return interaction.reply({
              content: '❌ Tu ne peux pas prendre ce ticket en charge.',
              ephemeral: true
            });
          }

          const claimedByList = Array.isArray(ticketData.claimedBy)
            ? [...ticketData.claimedBy]
            : [];

          if (!claimedByList.includes(interaction.user.id)) {
            claimedByList.push(interaction.user.id);
          }

          setTicket(ticketData.userId, {
            channelId: ticketData.channelId,
            subject: ticketData.subject,
            subjectId: ticketData.subjectId,
            claimedBy: claimedByList
          });

          const claimedMentions = claimedByList.length > 0
            ? claimedByList.map(id => `<@${id}>`).join(', ')
            : 'Personne';

          const updatedEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket ouvert')
            .setDescription(
              `**Utilisateur :** <@${ticketData.userId}>\n` +
              `**Sujet :** ${ticketData.subject}\n` +
              `**Statut :** Pris en charge\n` +
              `**Équipe STAFF en charge :** ${claimedMentions}\n\n` +
              `Explique ta demande dans ce salon.`
            )
            .setColor(0xfaa61a)
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('ticket_claim_button')
              .setLabel(buildClaimButtonLabel(claimedByList.length))
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('ticket_close_button')
              .setLabel('Fermer le ticket')
              .setStyle(ButtonStyle.Danger)
          );

          await interaction.update({
            embeds: [updatedEmbed],
            components: [row]
          });

          await sendTicketLog(
            interaction.guild,
            ticketData.subjectId,
            '📌 Ticket mis en charge',
            `**Utilisateur :** <@${ticketData.userId}>\n**Sujet :** ${ticketData.subject}\n**Staff :** ${claimedMentions}\n**Salon :** ${interaction.channel}`,
            0xfaa61a
          );

          return;
        }

        if (interaction.customId === 'ticket_close_button') {
          const ticketData = findTicketByChannelId(interaction.channel.id);

          if (!ticketData) {
            return interaction.reply({
              content: '❌ Ce salon n’est pas un ticket.',
              ephemeral: true
            });
          }

          const isOwner = interaction.user.id === ticketData.userId;

          const staffRole = interaction.guild.roles.cache.find(
            r => r.name === ticketConfig.staffRoleName
          );

          const hasStaffRole =
            staffRole && interaction.member.roles.cache.has(staffRole.id);

          const canManage = interaction.member.permissions.has(
            PermissionsBitField.Flags.ManageChannels
          );

          if (!isOwner && !hasStaffRole && !canManage) {
            return interaction.reply({
              content: '❌ Tu ne peux pas fermer ce ticket.',
              ephemeral: true
            });
          }

          const modal = new ModalBuilder()
            .setCustomId(`ticket_close_modal_${interaction.channel.id}`)
            .setTitle('Fermer le ticket');

          const reasonInput = new TextInputBuilder()
            .setCustomId('close_reason')
            .setLabel('Raison de la fermeture')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500)
            .setPlaceholder('Exemple : problème résolu, demande traitée...');

          const row = new ActionRowBuilder().addComponents(reasonInput);
          modal.addComponents(row);

          return interaction.showModal(modal);
        }
      }

      if (!interaction.isChatInputCommand()) return;

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction);
    } catch (error) {
      console.error('❌ Erreur interactionCreate :', error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ Une erreur est survenue.',
          ephemeral: true
        }).catch(() => null);
      } else {
        await interaction.reply({
          content: '❌ Une erreur est survenue.',
          ephemeral: true
        }).catch(() => null);
      }
    }
  }
};
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');

function normalizeColor(color) {
  if (!color) return null;

  const cleaned = color.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return `#${cleaned}`;
  }

  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createrole')
    .setDescription('Créer un rôle sur le serveur')
    .addStringOption(option =>
      option
        .setName('nom')
        .setDescription('Nom du rôle à créer')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption(option =>
      option
        .setName('couleur')
        .setDescription('Couleur du rôle en HEX, exemple : #5865F2')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('mentionnable')
        .setDescription('Le rôle peut-il être mentionné ?')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('afficher')
        .setDescription('Afficher le rôle séparément dans la liste des membres ?')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison de la création du rôle')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'createrole')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/createrole`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les rôles`.',
        ephemeral: true
      });
    }

    const name = interaction.options.getString('nom');
    const colorInput = interaction.options.getString('couleur');
    const mentionable = interaction.options.getBoolean('mentionnable') ?? false;
    const hoist = interaction.options.getBoolean('afficher') ?? false;
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    const existingRole = interaction.guild.roles.cache.find(
      role => role.name.toLowerCase() === name.toLowerCase()
    );

    if (existingRole) {
      return interaction.reply({
        content: `❌ Un rôle avec ce nom existe déjà : ${existingRole}`,
        ephemeral: true
      });
    }

    const color = normalizeColor(colorInput);

    if (colorInput && !color) {
      return interaction.reply({
        content: '❌ Couleur invalide. Utilise un format HEX comme `#5865F2`.',
        ephemeral: true
      });
    }

    const role = await interaction.guild.roles.create({
      name,
      color: color || undefined,
      mentionable,
      hoist,
      reason: `${reason} | Par ${interaction.user.tag}`
    });

    await sendDiscordLog(
      interaction.guild,
      'roles-logs',
      '🎭 Rôle créé',
      `**Rôle :** ${role}\n` +
      `**ID rôle :** ${role.id}\n` +
      `**Nom :** ${role.name}\n` +
      `**Couleur :** ${color || 'Par défaut'}\n` +
      `**Mentionnable :** ${mentionable ? 'Oui' : 'Non'}\n` +
      `**Affiché séparément :** ${hoist ? 'Oui' : 'Non'}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('🎭 Rôle créé')
      .setDescription(
        `**Rôle :** ${role}\n` +
        `**Nom :** ${role.name}\n` +
        `**Couleur :** ${color || 'Par défaut'}\n` +
        `**Mentionnable :** ${mentionable ? 'Oui' : 'Non'}\n` +
        `**Affiché séparément :** ${hoist ? 'Oui' : 'Non'}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(color || 0x57f287)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};
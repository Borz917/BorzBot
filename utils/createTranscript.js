const { AttachmentBuilder } = require('discord.js');

async function createTranscript(channel) {
  const messages = [];
  let lastId = null;

  while (messages.length < 1000) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;

    const fetched = await channel.messages.fetch(options);
    if (fetched.size === 0) break;

    fetched.forEach(msg => messages.push(msg));
    lastId = fetched.last().id;
  }

  const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const content = sorted.map(msg => {
    const date = new Date(msg.createdTimestamp).toLocaleString('fr-FR');
    const author = msg.author?.tag || 'Inconnu';
    const text = msg.content || '[Embed/Fichier/Message vide]';

    const files = msg.attachments.size > 0
      ? `\nFichiers : ${msg.attachments.map(a => a.url).join(', ')}`
      : '';

    return `[${date}] ${author} : ${text}${files}`;
  }).join('\n');

  return new AttachmentBuilder(Buffer.from(content || 'Aucun message.', 'utf8'), {
    name: `transcript-${channel.name}.txt`
  });
}

module.exports = createTranscript;
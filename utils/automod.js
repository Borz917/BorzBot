const badWords = [
  "fdp",
  "tg",
  "nique",
  "pute",
  "salope"
];

async function handleAutomod(message) {
  if (!message.guild || message.author.bot) return;

  const content = message.content.toLowerCase();

  if (badWords.some(word => content.includes(word))) {
    await message.delete().catch(() => {});

    await message.channel.send({
      content: `⚠️ ${message.author} langage interdit.`
    });

    return true;
  }

  if (
    content.includes("discord.gg/") ||
    content.includes("http://") ||
    content.includes("https://")
  ) {
    await message.delete().catch(() => {});

    await message.channel.send({
      content: `🚫 ${message.author} les liens sont interdits.`
    });

    return true;
  }

  return false;
}

module.exports = {
  handleAutomod
};
module.exports.config = {
  name: 'infos',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['about'],
  description: "Displays information about the bot",
  usage: "info",
  credits: '𝗠𝗲𝘁𝗼𝘂𝘀𝗵𝗲𝗹𝗮',
};

module.exports.run = async function({
  api,
  event,
  enableCommands
}) {
  try {
    const botName = "☘️𝗘𝗱𝘂𝗰𝗮𝘁𝗶𝗼𝗻𝗮𝗹 𝗯𝗼𝘁 𝘃2.0.1"; // Replace with your bot's name
    const creatorName = "𝗠𝗲𝘁𝗼𝘂𝘀𝗵𝗲𝗹𝗮 𝘄𝗮𝗹𝗸𝗲𝗿"; // Replace with the creator's name
    const totalCommands = enableCommands[0].commands.size; // Number of commands loaded
    const infoMessage = `🌟🤖 Bot Information 🤖🌟\n\n` +
      `💡 Name: ${botName}\n` +
      `👨‍💻 Creator: ${creatorName}\n` +
      `📜 Total Commands: ${totalCommands}\n` +
      `🕒 Uptime: ${process.uptime().toFixed(2)} seconds\n` +
      `\nThank you for using ${botName}! 🚀`;

    api.sendMessage(infoMessage, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("An error occurred while fetching bot information.", event.threadID, event.messageID);
  }
};

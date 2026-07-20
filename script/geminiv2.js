const axios = require('axios');

module.exports.config = {
  name: 'geminiv2',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['astro', 'zodiac'],
  description: "A Gemini API command",
  usage: "Gemini [query]",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');

  if (!input) {
    api.sendMessage(
      "[ Gemini ]\n\nPlease provide a query after 'gemini'. Example: 'gemini Tell me about Gemini.'",
      event.threadID,
      event.messageID
    );
    return;
  }

  api.sendMessage(
    "[ Gemini ]\n\nPlease wait...",
    event.threadID,
    (err, info) => {
      if (err) return;

      axios
        .get(`https://nash-api.onrender.com/api/gemini?query=${encodeURIComponent(input)}`)
        .then(({ data }) => {
          const response = data.response;

          api.editMessage(
            "[ Gemini ]\n\n" + response,
            info.messageID
          );
        })
        .catch(() => {
          api.editMessage(
            "[ Gemini ]\n\nAn error occurred while processing your request.",
            info.messageID
          );
        });
    }
  );
};

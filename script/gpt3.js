const axios = require('axios');

module.exports.config = {
  name: 'ai',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gpt', 'openai'],
  description: "An AI command powered by GPT-3.5",
  usage: "ai [prompt]",
  credits: 'Joshua Apostol',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');

  if (!input) {
    api.sendMessage(
      "[ AI ]\n\nPlease provide a query after 'ai'. Example: 'ai What is AI?'",
      event.threadID,
      event.messageID
    );
    return;
  }

  api.sendMessage(
    "[ AI ]\n\nPlease wait...",
    event.threadID,
    (err, info) => {
      if (err) return;

      axios
        .get(`https://nash-api.onrender.com/api/gpt3?query=${encodeURIComponent(input)}`)
        .then(({ data }) => {
          const response = data.response;

          api.editMessage(
            response,
            info.messageID
          );
        })
        .catch(() => {
          api.editMessage(
            "[ AI ]\n\nAn error occurred while processing your request.",
            info.messageID
          );
        });
    }
  );
};

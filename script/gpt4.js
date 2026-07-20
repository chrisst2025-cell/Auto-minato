const axios = require('axios');

module.exports.config = {
  name: 'gpt4',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gpt', 'openai'],
  description: "An AI command powered by GPT-4",
  usage: "gpt4 [prompt]",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');

  if (!input) {
    api.sendMessage(
      "GPT4🎁\n\nPlease provide a query after 'gpt4'. Example: 'gpt4 What is AI?'",
      event.threadID,
      event.messageID
    );
    return;
  }

  api.sendMessage(
    "GPT4🎁\n\nPlease wait...",
    event.threadID,
    (err, info) => {
      if (err) return;

      axios
        .get(`https://nash-api.onrender.com/api/gpt4?query=${encodeURIComponent(input)}`)
        .then(({ data }) => {
          const response = data.response;

          api.editMessage(
            response,
            info.messageID
          );
        })
        .catch(() => {
          api.editMessage(
            "An error occurred while processing your request.",
            info.messageID
          );
        });
    }
  );
};

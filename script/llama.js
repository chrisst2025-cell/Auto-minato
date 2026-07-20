const axios = require('axios');

module.exports.config = {
  name: 'llama',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['llama-vision'],
  description: "A command powered by Llama 3.2 Vision",
  usage: "Llama [query]",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');

  if (!input) {
    api.sendMessage(
      "[ Llama ]\n\nPlease provide a query after 'llama'. Example: 'llama Describe this image.'",
      event.threadID,
      event.messageID
    );
    return;
  }

  api.sendMessage(
    "[ Llama ]\n\nPlease wait...",
    event.threadID,
    (err, info) => {
      if (err) return;

      axios
        .get(`https://nash-api.onrender.com/api/llama-3.2-11b-vision-preview?query=${encodeURIComponent(input)}`)
        .then(({ data }) => {
          const response = data.response;

          api.editMessage(
             response,
            info.messageID
          );
        })
        .catch(() => {
          api.editMessage(
            "[ Llama ]\n\nAn error occurred while processing your request.",
            info.messageID
          );
        });
    }
  );
};

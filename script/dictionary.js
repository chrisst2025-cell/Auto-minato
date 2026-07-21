const axios = require("axios");

module.exports.config = {
  name: "dictionary",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['dict', 'dico'],
  description: "Recherche la définition d'un mot dans le dictionnaire",
  usage: "dictionary [mot]",
  credits: 'Chris st',
  cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(" ");
  if (!input) {
    return api.sendMessage("𝚅𝚎𝚞𝚒𝚕𝚕𝚎𝚣 𝚏𝚘𝚞𝚛𝚗𝚒𝚛 𝚞𝚗 𝚖𝚘𝚝 𝚊̀ 𝚌𝚑𝚎𝚛𝚌𝚑𝚎𝚛.", event.threadID, event.messageID);
  }

  try {
    const response = await axios.get(encodeURI(`https://api.dictionaryapi.dev/api/v2/entries/en/${input}`));
    const data = response.data[0];
    const phonetics = data.phonetics;
    const meanings = data.meanings;

    let msg_meanings = "";
    meanings.forEach((item) => {
      const definition = item.definitions[0].definition;
      const example = item.definitions[0].example ? `\n*𝚎𝚡𝚎𝚖𝚙𝚕𝚎:\n \"${item.definitions[0].example[0].toUpperCase() + item.definitions[0].example.slice(1)}\"` : "";
      msg_meanings += `\n• ${item.partOfSpeech}\n ${definition[0].toUpperCase() + definition.slice(1) + example}`;
    });

    let msg_phonetics = "";
    phonetics.forEach((item) => {
      const text = item.text ? `\n    /${item.text}/` : "";
      msg_phonetics += text;
    });

    const msg = `❰ ❝ ${data.word} ❞ ❱` + msg_phonetics + msg_meanings;
    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (error) {
    if (error.response?.status === 404) {
      api.sendMessage(`𝙰𝚞𝚌𝚞𝚗𝚎 𝚍𝚎́𝚏𝚒𝚗𝚒𝚝𝚒𝚘𝚗 𝚝𝚛𝚘𝚞𝚟𝚎́𝚎 𝚙𝚘𝚞𝚛 '${input}'.`, event.threadID, event.messageID);
    } else {
      api.sendMessage("𝚄𝚗𝚎 𝚎𝚛𝚛𝚎𝚞𝚛 𝚎𝚜𝚝 𝚜𝚞𝚛𝚟𝚎𝚗𝚞𝚎 𝚕𝚘𝚛𝚜 𝚍𝚎 𝚕𝚊 𝚛𝚎𝚌𝚑𝚎𝚛𝚌𝚑𝚎. 𝚅𝚎𝚞𝚒𝚕𝚕𝚎𝚣 𝚛𝚎́𝚎𝚜𝚜𝚊𝚢𝚎𝚛 𝚙𝚕𝚞𝚜 𝚝𝚊𝚛𝚍.", event.threadID, event.messageID);
    }
  }
};

const { origin } = require("fontstyles");
const chalk = require("chalk");

const smallCapsMap = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ',
  g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
  m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
  s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ'
};

const toSmallCaps = t =>
  (t || "").toLowerCase().split("").map(c => smallCapsMap[c] || c).join("");

module.exports.config = {
  name: "unfont",
  version: "1.0.0",
  role: 1,
  hasPrefix: true,
  credits: "Chris st",
  description: "Retire la police spéciale du message du bot en y réagissant",
  usage: "Réagissez avec 👍 à un message du bot",
  cooldown: 2,
};

module.exports.run = function ({ api, event }) {
  const botID = api.getCurrentUserID();

  try {
    if (event.type == "message_reaction" && botID === event.senderID) {
      if (event.reaction == "👍") {
        api.getMessage(event.threadID, event.messageID, (err, data) => {
          if (!err) {
            console.log(
              chalk.yellow("Police retirée pour le messageID:", data.messageID),
            );
            const results = data.body;
            api.editMessage(origin(results), event.messageID);
          }
        });
      }
    }
  } catch (error) {
    console.log(toSmallCaps("Une erreur est survenue :"), error);
  }
};

"use strict";
const axios = require("axios");

const smallCapsMap = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ',
  g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
  m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
  s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ'
};

const toSmallCaps = t =>
  (t || "").toLowerCase().split("").map(c => smallCapsMap[c] || c).join("");

module.exports = {
  config: {
    name: "font",
    aliases: ["stylefont"],
    version: "1.6.0",
    author: "Chris st",
    countDown: 5,
    role: 0,
    category: "utility",
    description: {
      en: "Convertir du texte dans différents styles de police"
    },
    guide: {
      en: "   {pn} list [texte]\n   {pn} [numéro] [texte]\n   Exemple: {pn} 43 Bonjour"
    }
  },

  onStart: async function ({ args, message, event }) {
    const { messageID } = event;

    if (args.length === 0) {
      return message.reply(
        `❌ ${toSmallCaps("utilisation")}:\n` +
        `.font list [${toSmallCaps("texte")}]\n` +
        `.font [${toSmallCaps("numero_style")}] [${toSmallCaps("texte")}]`
      );
    }

    const action = args[0].toLowerCase();

    try {
      if (action === "list") {
        const text = args.slice(1).join(" ") || "chris st";

        if (message.reaction) message.reaction("⏳", messageID);

        const res = await axios.get(`https://maybexenos.vercel.app/font-symbol/stylefont?text=${encodeURIComponent(text)}&all=true`);
        const styles = res.data.styles;

        if (!Array.isArray(styles)) {
          return message.reply(`❌ ${toSmallCaps("impossible de recuperer les styles de police.")}`);
        }

        let combinedMsg = `📋 ${toSmallCaps("liste des polices pour")} : "${text}"\n\n`;

        styles.forEach((item) => {
          combinedMsg += `${item.id}. ${toSmallCaps(item.label)}: ${item.result}\n`;
        });

        return message.reply(combinedMsg.trim());
      }

      if (!isNaN(action)) {
        const text = args.slice(1).join(" ");
        if (!text) {
          return message.reply(`❌ ${toSmallCaps("veuillez fournir un texte !")}\nExemple: .font ${action} Bonjour`);
        }

        if (message.reaction) message.reaction("⏳", messageID);

        const res = await axios.get(`https://maybexenos.vercel.app/font-symbol/stylefont?text=${encodeURIComponent(text)}&style=${action}&all=false`);

        const resultText = res.data.result ||
                          (res.data.styles && res.data.styles[0] ? res.data.styles[0].result : res.data);

        if (message.reaction) message.reaction("✨", messageID);
        return message.reply(resultText);
      }

      return message.reply(`❌ ${toSmallCaps("utilisation invalide !")}\n${toSmallCaps("utilisez")} : .font list [${toSmallCaps("texte")}] ${toSmallCaps("ou")} .font [${toSmallCaps("numero")}] [${toSmallCaps("texte")}]`);

    } catch (error) {
      console.error(error);
      if (message.reaction) message.reaction("❌", messageID);
      return message.reply(`❌ ${toSmallCaps("echec du traitement de votre demande.")}`);
    }
  }
};


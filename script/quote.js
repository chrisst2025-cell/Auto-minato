const axios = require('axios');

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
  name: "quote",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  description: "Obtenir une citation inspirante aléatoire.",
  usage: "quote",
  credits: "Chris st",
  cooldown: 0
};

module.exports.run = async ({
  api,
  event
}) => {
  const {
    threadID,
    messageID
  } = event;
  try {
    const response = await axios.get('https://api.quotable.io/random');
    const {
      content,
      author
    } = response.data;
    
    const text = `"${content}" - ${toSmallCaps(author)}`;
    api.sendMessage(text, threadID, messageID);
  } catch (error) {
    const errorMsg = toSmallCaps("Désolé, impossible de récupérer une citation pour le moment. Veuillez réessayer plus tard.");
    api.sendMessage(errorMsg, threadID, messageID);
  }
};

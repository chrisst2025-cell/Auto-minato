"use strict";
const axios = require("axios");
const moment = require("moment-timezone");

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
    name: "daily",
    version: "1.0.0",
    author: "Chris st",
    countDown: 5,
    role: 0,
    description: {
      vi: "Nhận quà hàng ngày với giao diện ảnh",
      en: "Obtenir une récompense quotidienne avec interface image"
    },
    category: "game",
    guide: {
      en: "   {pn}: Réclamer votre récompense quotidienne"
    },
    envConfig: {
      rewardFirstDay: { coin: 500, exp: 50 }
    }
  },

  onStart: async function ({ event, envCommands, usersData, message }) {
    const { senderID } = event;
    const reward = envCommands[this.config.name].rewardFirstDay;
    const timeZone = "Asia/Dhaka";
    const dateTime = moment.tz(timeZone).format("DD/MM/YYYY");
    const currentDay = new Date().getDay();
    const dayIndex = currentDay === 0 ? 7 : currentDay;

    const bgList = [
      "https://i.imgur.com/mCYvXgK.gif",
      "https://i.imgur.com/tu9CTDM.gif",
      "https://i.imgur.com/hR7SkFv.gif",
      "https://i.imgur.com/TQa0A8u.gif",
      "https://i.imgur.com/kIbC2kN.gif"
    ];

    const userData = await usersData.get(senderID);

    if (!userData.data.dailyClaim || userData.data.dailyClaim.date !== dateTime) {
      userData.data.dailyClaim = { date: dateTime, count: 0 };
    }

    if (userData.data.dailyClaim.count >= 5) {
      return message.reply(`🚫 ${toSmallCaps("acces refuse : limite de 5/5 atteinte !")}`);
    }

    const getCoin = Math.floor(reward.coin * Math.pow(1.2, dayIndex - 1));
    const getExp = Math.floor(reward.exp * Math.pow(1.2, dayIndex - 1));

    userData.data.dailyClaim.count += 1;
    const currentCount = userData.data.dailyClaim.count;

    await usersData.set(senderID, {
      money: userData.money + getCoin,
      exp: userData.exp + getExp,
      data: userData.data
    });

    try {
      const userName = (userData.name || "").toUpperCase();
      const avatarURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const randomBG = bgList[Math.floor(Math.random() * bgList.length)];

      const cardUrl = `https://maybexenos.vercel.app/daily-reward/daily?background=${encodeURIComponent(randomBG)}&avatar=${encodeURIComponent(avatarURL)}&text1=${encodeURIComponent(userName)}&text2=CLAIM+${currentCount}/5&text3=%2B${getCoin}+COIN`;

      const imageStream = (await axios.get(cardUrl, { responseType: "stream" })).data;

      const responseText = [
        "╭┈─────── ೄྀ࿐",
        `  ${toSmallCaps("recompense quotidienne")}`,
        ` ◈ ${toSmallCaps("pieces")} : +${getCoin}`,
        ` ◈ ${toSmallCaps("exp")}    : +${getExp}`,
        ` ◈ ${toSmallCaps("claim")}  : ${currentCount}/5`,
        "╰┈──────┈──────┈"
      ].join("\n");

      return message.reply({
        body: responseText,
        attachment: imageStream
      });
    } catch (err) {
      return message.reply(`✅ ${toSmallCaps(`+${getCoin} pièces ajoutées avec succès !`)}`);
    }
  }
};


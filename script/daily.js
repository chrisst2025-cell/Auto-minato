const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "daily",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["claim"],
  description: "Receive daily rewards with image interface",
  usage: "daily",
  credits: "Chris st",
  cooldown: 5
};

module.exports.run = async function ({ api, event, usersData }) {
  const { threadID, messageID, senderID } = event;
  
  const rewardFirstDay = { coin: 500, exp: 50 };
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

  try {
    let userData = {};
    if (usersData && typeof usersData.get === "function") {
      userData = await usersData.get(senderID) || {};
    }

    if (!userData.data) userData.data = {};
    if (!userData.data.dailyClaim || userData.data.dailyClaim.date !== dateTime) {
      userData.data.dailyClaim = { date: dateTime, count: 0 };
    }

    if (userData.data.dailyClaim.count >= 5) {
      return api.sendMessage("🚫 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗: 𝟱/𝟱 𝗟𝗶𝗺𝗶𝘁 𝗥𝗲𝗮𝗰𝗵𝗲𝗱!", threadID, messageID);
    }

    const getCoin = Math.floor(rewardFirstDay.coin * (1.2) ** (dayIndex - 1));
    const getExp = Math.floor(rewardFirstDay.exp * (1.2) ** (dayIndex - 1));

    userData.data.dailyClaim.count += 1;
    const currentCount = userData.data.dailyClaim.count;

    const currentMoney = userData.money || 0;
    const currentExp = userData.exp || 0;

    if (usersData && typeof usersData.set === "function") {
      await usersData.set(senderID, {
        money: currentMoney + getCoin,
        exp: currentExp + getExp,
        data: userData.data
      });
    }

    let userName = "USER";
    if (userData.name) {
      userName = userData.name.toUpperCase();
    } else if (usersData && typeof usersData.getName === "function") {
      const name = await usersData.getName(senderID);
      if (name) userName = name.toUpperCase();
    }

    const avatarURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const randomBG = bgList[Math.floor(Math.random() * bgList.length)];

    const cardUrl = `https://maybexenos.vercel.app/daily-reward/daily?background=${encodeURIComponent(randomBG)}&avatar=${encodeURIComponent(avatarURL)}&text1=${encodeURIComponent(userName)}&text2=CLAIM+${currentCount}/5&text3=%2B${getCoin}+COIN`;

    const imageStream = (await axios.get(cardUrl, { responseType: 'stream' })).data;

    return api.sendMessage({
      body: `✨ Reward Claimed (${currentCount}/5)!`,
      attachment: imageStream
    }, threadID, messageID);

  } catch (err) {
    console.error("Daily reward error:", err);
    return api.sendMessage(`✅ +500 Coins Successfully Claimed!`, threadID, messageID);
  }
};

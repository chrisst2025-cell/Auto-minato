"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp) global.temp = {};
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

const CACHE_DIR = path.join(__dirname, "cache");
const BATCH_MS = 2000;

const BG_LIST = [
  "https://i.imgur.com/mCYvXgK.gif",
  "https://i.imgur.com/tu9CTDM.gif"
];

function getSession(h) {
  if (h <= 10) return "morning";
  if (h <= 12) return "noon";
  if (h <= 18) return "afternoon";
  return "evening";
}

async function fetchCard(uid, name, groupName, memberCount, bg) {
  const avatarURL =
    `https://graph.facebook.com/${uid}/picture?width=512&height=512` +
    `&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const cardUrl =
    `https://maybexenos.vercel.app/welcome-card/greetings` +
    `?avatar=${encodeURIComponent(avatarURL)}` +
    `&username=${encodeURIComponent(name.toUpperCase())}` +
    `&type=welcome` +
    `&groupname=${encodeURIComponent(groupName.toUpperCase())}` +
    `&groupfont=VALUE` +
    `&count=${memberCount}` +
    `&bg=${encodeURIComponent(bg || "")}`;

  const res = await axios.get(cardUrl, { responseType: "arraybuffer", timeout: 15000 });
  await fs.ensureDir(CACHE_DIR);
  const imgPath = path.join(CACHE_DIR, `welcome_${uid}_${Date.now()}.png`);
  await fs.writeFile(imgPath, res.data);
  return imgPath;
}

async function flushBatch(threadID, batch, api, threadsData) {
  try {
    let threadData = {};
    if (threadsData && typeof threadsData.get === "function") {
      threadData = await threadsData.get(threadID) || {};
    }

    if (threadData?.settings?.sendWelcomeMessage === false) return;

    let prefix = "/";
    if (global.utils && typeof global.utils.getPrefix === "function") {
      prefix = global.utils.getPrefix(threadID);
    } else if (global.config && global.config.PREFIX) {
      prefix = global.config.PREFIX;
    }

    const dataBanned = threadData?.data?.banned_ban || [];
    let memberCount = 0;
    let groupName = "OUR GROUP";

    try {
      const tInfo = await api.getThreadInfo(threadID);
      memberCount = tInfo.participantIDs?.length || 0;
      groupName = (threadData?.threadName || tInfo.threadName || "Our Group").toUpperCase();
    } catch (_) {
      groupName = (threadData?.threadName || "Our Group").toUpperCase();
    }

    const h = new Date().getHours();
    const session = getSession(h);

    const defaultTemplate =
      "👋 Welcome to {boxName}, {userName}!\n" +
      "You are member #{count} 🎉\n" +
      "Have a great {session}! 😊\n" +
      "Type {prefix}help for all commands.";

    for (const { uid, name } of batch) {
      if (dataBanned.some(b => b.id == uid)) continue;

      const template = threadData?.data?.welcomeMessage || defaultTemplate;

      const body = template
        .replace(/\{userName\}|\{userNameTag\}/g, name)
        .replace(/\{boxName\}|\{threadName\}/g, threadData?.threadName || groupName)
        .replace(/\{count\}/g, memberCount)
        .replace(/\{session\}/g, session)
        .replace(/\{prefix\}/g, prefix);

      const form = {
        body,
        mentions: [{ tag: name, id: uid }]
      };

      let imgPath = null;
      try {
        const bg = BG_LIST.length > 0 ? BG_LIST[Math.floor(Math.random() * BG_LIST.length)] : "";
        imgPath = await fetchCard(uid, name, groupName, memberCount, bg);
        form.attachment = fs.createReadStream(imgPath);

        await api.sendMessage(form, threadID, () => {
          if (imgPath && fs.existsSync(imgPath)) {
            try { fs.unlinkSync(imgPath); } catch (_) {}
          }
        });
      } catch (_) {
        delete form.attachment;
        try { await api.sendMessage(form, threadID); } catch (__) {}
        if (imgPath && fs.existsSync(imgPath)) {
          try { fs.unlinkSync(imgPath); } catch (_) {}
        }
      }

      memberCount++;
    }
  } catch (_) {}
}

module.exports.config = {
  name: "welcome",
  version: "3.0.0",
  credits: "Chris st",
  description: "Auto welcome new members with styled image card and custom templates."
};

module.exports.onEvent = async function ({ api, event, threadsData }) {
  if (event.logMessageType !== "log:subscribe") return;

  const { threadID } = event;
  const participants = event.logMessageData?.addedParticipants || [];
  if (!participants.length) return;

  const botID = api.getCurrentUserID();

  let prefix = "/";
  if (global.utils && typeof global.utils.getPrefix === "function") {
    prefix = global.utils.getPrefix(threadID);
  } else if (global.config && global.config.PREFIX) {
    prefix = global.config.PREFIX;
  }

  if (participants.some(p => p.userFbId == botID)) {
    const nick = global.GoatBot?.config?.nickNameBot || global.config?.BOTNAME;
    if (nick) {
      try { api.changeNickname(nick, threadID, botID); } catch (_) {}
    }
    const welcomeBotMsg = `🤖 Thanks for adding me!\n◈ Prefix : ${prefix}\n◈ Commands: ${prefix}help`;
    try { api.sendMessage(welcomeBotMsg, threadID); } catch (_) {}
    return;
  }

  if (!global.temp.welcomeEvent[threadID]) {
    global.temp.welcomeEvent[threadID] = { timer: null, batch: [] };
  }

  for (const user of participants) {
    if (user.userFbId == botID) continue;
    global.temp.welcomeEvent[threadID].batch.push({
      uid: user.userFbId,
      name: user.fullName || "Member"
    });
  }

  clearTimeout(global.temp.welcomeEvent[threadID].timer);

  global.temp.welcomeEvent[threadID].timer = setTimeout(() => {
    const batch = global.temp.welcomeEvent[threadID]?.batch || [];
    delete global.temp.welcomeEvent[threadID];
    flushBatch(threadID, batch, api, threadsData).catch(() => {});
  }, BATCH_MS);
};


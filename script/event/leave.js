"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp) global.temp = {};
if (!global.temp._leaveQueue) global.temp._leaveQueue = new Map();

const BATCH_MS = 1800;
const CACHE_DIR = path.join(__dirname, "cache");

function session(h) {
  if (h <= 10) return "morning";
  if (h <= 12) return "noon";
  if (h <= 18) return "afternoon";
  return "evening";
}

async function fetchCard(avatarURL, name, groupName, bgURL) {
  const url =
    `https://maybexenos.vercel.app/welcome-card/greetings` +
    `?avatar=${encodeURIComponent(avatarURL)}` +
    `&username=${encodeURIComponent(name.toUpperCase())}` +
    `&type=leave` +
    `&groupname=${encodeURIComponent(groupName.toUpperCase())}` +
    `&bg=${encodeURIComponent(bgURL)}`;

  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 12000 });
  await fs.ensureDir(CACHE_DIR);
  const filePath = path.join(CACHE_DIR, `leave_${Date.now()}_${Math.random().toString(36).slice(2)}.png`);
  await fs.writeFile(filePath, res.data);
  return filePath;
}

const LEAVE_BGS = [
  "https://i.imgur.com/3LyJqmO.gif",
  "https://i.imgur.com/mCYvXgK.gif",
  "https://i.imgur.com/Yv6iVCH.gif"
];

async function flushBatch(threadID, batch, api) {
  try {
    const h = new Date().getHours();
    const sess = session(h);
    const now = new Date().toLocaleString("fr-FR");

    let memberCount = 0;
    let groupName = "THE GROUP";

    try {
      const tInfo = await api.getThreadInfo(threadID);
      memberCount = tInfo.participantIDs?.length || 0;
      groupName = (tInfo.threadName || "THE GROUP").toUpperCase();
    } catch (_) {}

    const templateRaw = "👋 {userName} {type} the group.\n🕐 {time}  •  👥 {count} remaining";

    for (const { uid, name, isKicked } of batch) {
      const botID = await api.getCurrentUserID();
      if (String(uid) === String(botID)) continue;

      const type = isKicked ? "was kicked from" : "left";

      let msg = templateRaw
        .replace(/\{userName\}|\{userNameTag\}/g, name)
        .replace(/\{type\}/g, type)
        .replace(/\{threadName\}|\{boxName\}/g, groupName)
        .replace(/\{time\}/g, now)
        .replace(/\{session\}/g, sess)
        .replace(/\{count\}/g, memberCount);

      const form = {
        body: msg,
        mentions: [{ tag: name, id: uid }]
      };

      let imgPath = null;
      try {
        const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const bg = LEAVE_BGS[Math.floor(Math.random() * LEAVE_BGS.length)];
        imgPath = await fetchCard(avatarURL, name, groupName, bg);
        form.attachment = fs.createReadStream(imgPath);
      } catch (_) {}

      try {
        await api.sendMessage(form, threadID, () => {
          if (imgPath && fs.existsSync(imgPath)) {
            try { fs.unlinkSync(imgPath); } catch (_) {}
          }
        });
      } catch (e) {
        delete form.attachment;
        try { await api.sendMessage(form, threadID); } catch (_) {}
      }
    }
  } catch (_) {}
}

module.exports.config = {
  name: "leave",
  version: "3.0.0",
  credits: "Chris st",
  description: "Auto send leave/kick message with styled card image."
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.logMessageType !== "log:unsubscribe") return;

  const { threadID } = event;
  const uid = event.logMessageData?.leftParticipantFbId;
  if (!uid) return;

  const botID = await api.getCurrentUserID();
  if (String(uid) === String(botID)) return;

  const isKicked = String(uid) !== String(event.author);

  let name = "Member";
  try {
    const info = await api.getUserInfo(uid);
    name = info[uid]?.name || "Member";
  } catch (_) {}

  const queue = global.temp._leaveQueue.get(threadID) || [];
  queue.push({ uid, name, isKicked });
  global.temp._leaveQueue.set(threadID, queue);

  const timerKey = `_leaveTimer_${threadID}`;
  if (global.temp[timerKey]) clearTimeout(global.temp[timerKey]);

  global.temp[timerKey] = setTimeout(() => {
    delete global.temp[timerKey];
    const batch = global.temp._leaveQueue.get(threadID) || [];
    global.temp._leaveQueue.delete(threadID);
    flushBatch(threadID, batch, api).catch(() => {});
  }, BATCH_MS);
};

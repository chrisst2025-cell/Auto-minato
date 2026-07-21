"use strict";
const fs = require("fs-extra");
const path = require("path");

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
  name: "restart",
  aliases: ["reboot"],
  version: "2.0.0",
  hasPermssion: 2,
  credits: "Chris st",
  description: "Redémarrer le bot",
  usePrefix: true,
  commandCategory: "Owner",
  usages: "[raison]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.onLoad = function ({ api }) {
  if (!api) return;
  const pathFile = path.join(__dirname, "tmp", "restart.txt");
  if (fs.existsSync(pathFile)) {
    try {
      const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
      const restartTime = ((Date.now() - parseInt(time)) / 1000).toFixed(2);
      setTimeout(() => {
        try {
          api.sendMessage(`✦ ${toSmallCaps("redemarrage termine")}\n◈ ${toSmallCaps("temps")} : ${restartTime}s`, parseInt(tid));
        } catch (_) {}
      }, 2000);
      fs.unlinkSync(pathFile);
    } catch (_) {
      try { fs.unlinkSync(pathFile); } catch (_) {}
    }
  }
};

module.exports.run = async function ({ api, event, args, box }) {
  const reason = args.join(" ").trim();
  const tmpDir = path.join(__dirname, "tmp");
  const pathFile = path.join(tmpDir, "restart.txt");

  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);

  const msg = `◈ ${toSmallCaps("redemarrage en cours...")}\n` + (reason ? `◈ ${toSmallCaps("raison")} : ${reason}\n` : "");

  if (box && box.reply) {
    await box.reply(msg);
  } else {
    await api.sendMessage(msg, event.threadID, event.messageID);
  }

  process.exit(2);
};


"use strict";
const os = require("os");

let cooldownManager, analyticsBatcher;
try { cooldownManager = require("../../core/func/cooldownManager.js"); } catch {}
try { analyticsBatcher = require("../../core/func/analyticsBatcher.js"); } catch {}

const smallCapsMap = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ',
  g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
  m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
  s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ'
};

const toSmallCaps = t =>
  (t || "").toLowerCase().split("").map(c => smallCapsMap[c] || c).join("");

function fmtBytes(b) {
  if (b === 0) return "0 ʙ";
  const k = 1024, s = ["ʙ", "ᴋʙ", "ᴍʙ", "ɢʙ"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + s[i];
}

function fmtUptime(s) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${d}ᴅ ${h}ʜ ${m}ᴍ ${sec}ꜱ`;
}

function cpuUsagePct() {
  const cpus = os.cpus();
  let idle = 0, total = 0;
  for (const c of cpus) {
    for (const v of Object.values(c.times)) total += v;
    idle += c.times.idle;
  }
  return Math.max(0, Math.min(100, 100 - (idle / total) * 100)).toFixed(1);
}

module.exports = {
  config: {
    name: "stats",
    version: "2.0.0",
    author: "Chris st",
    countDown: 5,
    role: 0,
    description: { en: "ᴠɪᴇᴡ ʙᴏᴛ ꜱʏꜱᴛᴇᴍ ꜱᴛᴀᴛꜱ" },
    category: "utility",
    guide: { en: "{pn}\n{pn} clear — ɢᴀʀʙᴀɢᴇ ᴄᴏʟʟᴇᴄᴛ" }
  },

  onStart: async function ({ message, args }) {
    if (args[0] === "clear") {
      if (global.gc) {
        global.gc();
        return message.reply(`✦ ${toSmallCaps("garbage collector triggered")}`);
      }
      return message.reply(`⌀ ${toSmallCaps("gc not exposed")}`);
    }

    try {
      const mem      = process.memoryUsage();
      const total    = os.totalmem();
      const free     = os.freemem();
      const cmds     = global.GoatBot?.commands?.size || 0;
      const events   = global.GoatBot?.eventCommands?.size || 0;
      const aliases  = global.GoatBot?.aliases?.size || 0;
      const threads  = global.db?.allThreadData?.length || 0;
      const users    = global.db?.allUserData?.length || 0;
      const premiums = (global.GoatBot?.config?.premiumUsers || []).length;
      const admins   = (global.GoatBot?.config?.adminBot || []).length;
      const cdStats  = cooldownManager?.getStats?.() || {};
      const anStats  = analyticsBatcher?.getStats?.() || {};

      const response = [
        "╭┈─────── ೄྀ࿐",
        ` ◈ ${toSmallCaps("uptime")}    : ${fmtUptime(process.uptime())}`,
        ` ◈ ${toSmallCaps("commandes")} : ${cmds}`,
        ` ◈ ${toSmallCaps("evenements")} : ${events}`,
        ` ◈ ${toSmallCaps("aliases")}   : ${aliases}`,
        ` ◈ ${toSmallCaps("groupes")}   : ${threads}`,
        ` ◈ ${toSmallCaps("utilisateurs")}: ${users}`,
        ` ◈ ${toSmallCaps("premium")}   : ${premiums}`,
        ` ◈ ${toSmallCaps("admins")}    : ${admins}`,
        " ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄",
        ` ◈ ${toSmallCaps("heap utilise")} : ${fmtBytes(mem.heapUsed)}`,
        ` ◈ ${toSmallCaps("heap total")}   : ${fmtBytes(mem.heapTotal)}`,
        ` ◈ ${toSmallCaps("rss")}          : ${fmtBytes(mem.rss)}`,
        " ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄",
        ` ◈ ${toSmallCaps("sys total")} : ${fmtBytes(total)}`,
        ` ◈ ${toSmallCaps("sys libre")} : ${fmtBytes(free)}`,
        ` ◈ ${toSmallCaps("sys utilise")}: ${fmtBytes(total - free)}`,
        ` ◈ ${toSmallCaps("usage cpu")} : ${cpuUsagePct()}%`,
        " ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄",
        ` ◈ ${toSmallCaps("cooldown")}  : ${cdStats.totalEntries || 0} ${toSmallCaps("entrees")}`,
        ` ◈ ${toSmallCaps("analytics")} : ${anStats.bufferSize || 0} ${toSmallCaps("en attente")}`,
        ` ◈ ${toSmallCaps("node")}      : ${process.version}`,
        ` ◈ ${toSmallCaps("plateforme")}: ${os.platform()} ${os.arch()}`,
        "╰┈──────┈──────┈"
      ].join("\n");

      return message.reply(response);
    } catch (err) {
      return message.reply(`⌀ ${toSmallCaps("erreur stats")}: ${err.message}`);
    }
  }
};


const fs = require("fs-extra");
const path = require("path");

const CONFIG_FILE = path.join(process.cwd(), "config.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { typingIndicator: { enable: true, duration: 2000, excludeThreads: [] }, optionsFca: { simulateTyping: true } };
  }
  return fs.readJsonSync(CONFIG_FILE);
}

function saveConfig(cfg) {
  fs.writeJsonSync(CONFIG_FILE, cfg, { spaces: 2 });
}

function fmtMs(ms) {
  if (ms < 1000) return `${ms}ᴍꜱ`;
  return `${(ms / 1000).toFixed(1)}ꜱ`;
}

module.exports.config = {
  name: "typing",
  version: "2.0.0",
  role: 2, // Accessible aux administrateurs du bot
  hasPrefix: true,
  aliases: ["type"],
  description: "Gérer le système d'indicateur de saisie (Typing Indicator)",
  usage: "{pn} on | off | set <ms> | simulate on/off | exclude [tid] | include [tid] | status | test",
  credits: "SIFAT (adapté par Chris)",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args, prefix }) {
  const { threadID, messageID } = event;
  const sub = (args[0] || "").toLowerCase();

  const cfg = loadConfig();
  if (!cfg.typingIndicator) cfg.typingIndicator = { enable: true, duration: 2000, excludeThreads: [] };
  if (!cfg.optionsFca) cfg.optionsFca = { simulateTyping: true };

  const ti = cfg.typingIndicator;

  // 1. Activer l'indicateur
  if (sub === "on") {
    ti.enable = true;
    saveConfig(cfg);
    return api.sendMessage(
      `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n✦ ᴛʏᴘɪɴɢ ɪɴᴅɪᴄᴀᴛᴏʀ: ᴏɴ\n◈ ᴅᴜʀᴀᴛɪᴏɴ: ${fmtMs(ti.duration ?? 2000)}\n╰━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  }

  // 2. Désactiver l'indicateur
  if (sub === "off") {
    ti.enable = false;
    saveConfig(cfg);
    return api.sendMessage(
      `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n✦ ᴛʏᴘɪɴɢ ɪɴᴅɪᴄᴀᴛᴏʀ: ᴏꜰꜰ\n╰━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  }

  // 3. Modifier la durée
  if (sub === "set") {
    const ms = Number(args[1]);
    if (isNaN(ms) || ms < 100) {
      return api.sendMessage(
        `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n⌀ ᴅᴜʀᴀᴛɪᴏɴ ᴍᴜꜱᴛ ʙᴇ ≥ 100 ᴍꜱ\n╰━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    }
    ti.duration = ms;
    saveConfig(cfg);
    return api.sendMessage(
      `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n✦ ᴅᴜʀᴀᴛɪᴏɴ → ${fmtMs(ms)}\n╰━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  }

  // 4. Activer/désactiver la simulation
  if (sub === "simulate") {
    const val = (args[1] || "").toLowerCase() !== "off";
    cfg.optionsFca.simulateTyping = val;
    saveConfig(cfg);
    return api.sendMessage(
      val
        ? `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n✦ ꜱɪᴍᴜʟᴀᴛᴇ ᴛʏᴘɪɴɢ: ᴏɴ\n╰━━━━━━━━━━━━━━━╯`
        : `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n✦ ꜱɪᴍᴜʟᴀᴛᴇ ᴛʏᴘɪɴɢ: ᴏꜰꜰ\n╰━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  }

  // 5. Exclure un groupe
  if (sub === "exclude") {
    const tid = args[1] || threadID;
    if (!ti.excludeThreads) ti.excludeThreads = [];
    if (ti.excludeThreads.includes(tid)) {
      return api.sendMessage(
        `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n⌀ ᴛʜʀᴇᴀᴅ ᴀʟʀᴇᴀᴅʏ ᴇxᴄʟᴜᴅᴇᴅ\n╰━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    }
    ti.excludeThreads.push(tid);
    saveConfig(cfg);
    return api.sendMessage(
      `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n✦ ᴇxᴄʟᴜᴅᴇᴅ: ${tid}\n╰━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  }

  // 6. Réintégrer un groupe
  if (sub === "include") {
    const tid = args[1] || threadID;
    if (!ti.excludeThreads?.includes(tid)) {
      return api.sendMessage(
        `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n⌀ ᴛʜʀᴇᴀᴅ ɴᴏᴛ ɪɴ ᴇxᴄʟᴜᴅᴇ ʟɪꜱᴛ\n╰━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    }
    ti.excludeThreads = ti.excludeThreads.filter((t) => t !== tid);
    saveConfig(cfg);
    return api.sendMessage(
      `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n✦ ʀᴇ-ɪɴᴄʟᴜᴅᴇᴅ: ${tid}\n╰━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  }

  // 7. Tester l'indicateur de saisie
  if (sub === "test") {
    const dur = ti.duration ?? 2000;
    try {
      await api.sendTypingIndicator(true, threadID);
      setTimeout(() => {
        try {
          api.sendTypingIndicator(false, threadID);
        } catch (_) {}
      }, dur);
      return api.sendMessage(
        `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n✦ ᴛᴇꜱᴛ ᴛʏᴘɪɴɢ ꜱᴇɴᴛ (${fmtMs(dur)})\n╰━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    } catch (err) {
      return api.sendMessage(
        `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n⌀ ꜰᴀɪʟᴇᴅ: ${err.message || "unknown"}\n╰━━━━━━━━━━━━━━━╯`,
        threadID,
        messageID
      );
    }
  }

  // 8. Afficher le statut (par défaut)
  if (!sub || sub === "status") {
    const exCount = (ti.excludeThreads || []).length;
    return api.sendMessage(
      `╭━━━━  𝙼𝙸𝙽𝙰𝚃𝙾 𝙰𝙸  ━━━━╮\n✦ ᴛʏᴘɪɴɢ ꜱᴛᴀᴛᴜꜱ\n◈ ᴇɴᴀʙʟᴇᴅ   : ${ti.enable === false ? "⛔ ᴏꜰꜰ" : "✅ ᴏɴ"}\n◈ ᴅᴜʀᴀᴛɪᴏɴ  : ${fmtMs(ti.duration ?? 2000)}\n◈ ꜱɪᴍᴜʟᴀᴛᴇ : ${cfg.optionsFca?.simulateTyping !== false ? "✅ ᴏɴ" : "⛔ ᴏꜰꜰ"}\n◈ ᴇxᴄʟᴜᴅᴇᴅ : ${exCount} ᴛʜʀᴇᴀᴅ(ꜱ)\n╰━━━━━━━━━━━━━━━╯`,
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    `⚠️ Subcommande inconnue.\nUtilisation : ${prefix}typing [on | off | set <ms> | simulate on/off | exclude | include | test | status]`,
    threadID,
    messageID
  );
};


"use strict";

if (!global.autoReactData) global.autoReactData = new Map();

const EMOJIS = [
    "🐍🤕🙎👺😏😩", "😩🌝😪🥲🙂🐤", "😏🍂🪺🤌🙃🐥",
    "😜😝😋😏😌😌😏", "😰😨😥😟😓😿", "😕🫤😯😮😏",
    "💜❤️🧡💥⚡🪴", "✨❤️‍🔥❤️‍🩹❤️‍🩹🗣️👤", "🐥🫦👄👀👂👏",
    "🔥🫁🫂🫶🤌🤙🤟", "❤️💌🩶🖤💜🎊", "✨💥💢💨💤🕳️🌟✨",
    "🫠✨🦋🌈🦄🍭🌸🎀", "🪐☄️🛸🌌🔭🌑🛰️🛡️", "🍓🍰🍦🍩🍪🥤🧁🍮",
    "🦁🐯🦒🐘🦏🐆🦓🦒", "🌊🐚⛵🏝️🐬🐙🐠🦞", "🍄🌿🍃🍀🌱🪴🎋🌻",
    "🎮🕹️👾🏎️🧩🎲🎯🎳", "🎸🎷🥁🎻🎹🎤🎧🎹", "🍕🍔🍟🌮🍣🍜🥗🥘",
    "🧘‍♀️🕯️🫧💎🧿🔮🏺📜", "🏰🎡🎢🎠🎪🎭🎨🎬", "🚀🛰️🛸👽👾🤖🎃👻",
    "🍎🍊🍋🥝🫐🍇🍐🍑", "⚽🏀🏈⚾🥎🎾🏐🏉", "🚗🚕🚙🚌🚎🏎️Voici la commande adaptée pour utiliser la structure `module.exports.config` et `module.exports.run` / `module.exports.handleEvent`, tout en conservant vos règles de formatage (petites capitales pour le texte, auteur **Chris st** et gestion des rôles/administrateurs) :

```javascript
"use strict";

if (!global.autoReactData) global.autoReactData = new Map();

const EMOJIS = [
    "🐍🤕🙎👺😏😩", "😩🌝😪🥲🙂🐤", "😏🍂🪺🤌🙃🐥",
    "😜😝😋😏😌😌😏", "😰😨😥😟😓😿", "😕🫤😯😮😏",
    "💜❤️🧡💥⚡🪴", "✨❤️‍🔥❤️‍🩹❤️‍🩹🗣️👤", "🐥🫦👄👀👂👏",
    "🔥🫁🫂🫶🤌🤙🤟", "❤️💌🩶🖤💜🎊", "✨💥💢💨💤🕳️🌟✨",
    "🫠✨🦋🌈🦄🍭🌸🎀", "🪐☄️🛸🌌🔭🌑🛰️🛡️", "🍓🍰🍦🍩🍪🥤🧁🍮",
    "🦁🐯🦒🐘🦏🐆🦓🦒", "🌊🐚⛵🏝️🐬🐙🐠🦞", "🍄🌿🍃🍀🌱🪴🎋🌻",
    "🎮🕹️👾🏎️🧩🎲🎯🎳", "🎸🎷🥁🎻🎹🎤🎧🎹", "🍕🍔🍟🌮🍣🍜🥗🥘",
    "🧘‍♀️🕯️🫧💎🧿🔮🏺📜", "🏰🎡🎢🎠🎪🎭🎨🎬", "🚀🛰️🛸👽👾🤖🎃👻",
    "🍎🍊🍋🥝🫐🍇🍐🍑", "⚽🏀🏈⚾🥎🎾🏐🏉", "🚗🚕🚙🚌🚎🏎️🚓🚑",
    "☀️🌤️⛅🌦️☁️🌧️⛈️🌩️", "🌹🌷🌻🌼🪷🪻💐🪴", "🧸🪁🪀🪄🎈🎁🎊🎉",
    "💻⌨️🖱️🖨️📱⌚📷🎥", "🏠🏡🏘️🛖🏢🏣🏥🏦", "🦉🦅🦜🕊️🦩🦚🦢🦆",
    "🐉🦖🐢🐊🐍🦎🐙🦞", "🏔️⛰️🌋🗻🪵🌵🌴", "🍵☕🍷🍹🍺🍻🥂🥤",
    "🥐🥖🥨🥯🥞🧇🍳🥓", "🛹🚲🛵🏍️🛶🚤🚢✈️", "🎭🎨🖌️🖍️🧵🧶🪡🧷",
    "🕰️⌛⏳⚖️🕯️🔦🔋🔌", "📓📔📒📕📗📘📙📚", "RING💎💄📿👠👡👢👞",
    "🧗‍♂️🚴‍♀️🏆🥇🥈🥉🏅🎖️", "🎭🎟️🎫🎬🎤🎧🎹", "🧪🧬🔬🔭📡🛰️🛸🌌",
    "🧺🪠🧹🧼🪣🧽🪒🧴", "🔑🗝️🔓🔒🔏🔐🚩", "💌🎀🎁🎈🏮🧧🎐🎎",
    "🧬💊🩹🩺🩸💉🧪", "🧸🧿🪬🧧🎐🪩🪅🪄", "🔱⚜️⚠️♻️🌀🛟🪁",
    "🫂💖💔❤️‍🔥✨❤️‍🩹", "🫀🧠齿骨👣👁️👄", "🌆🏙️🌃🌇🌉🌅🎆",
    "🌌🪐🌕🌒🌔🌗🌖🌘", "🌵🌾🌿🍃🍀🍂🍁🥀", "🍄🐚🪸🪹🪺🪨🪵🪴"
];

const smallCapsMap = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ',
  g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
  m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
  s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ'
};

const toSmallCaps = t =>
  (t || "").toLowerCase().split("").map(c => smallCapsMap[c] || c).join("");

function isBotAdmin(senderID) {
    const cfg = global.GoatBot?.config;
    if (!cfg) return false;
    const id = String(senderID);
    return (cfg.adminBot     || []).map(String).includes(id)
        || (cfg.devUsers     || []).map(String).includes(id)
        || (cfg.premiumUsers || []).map(String).includes(id);
}

function getState(threadID) {
    return global.autoReactData.get(String(threadID)) || { active: false, mode: "all" };
}

function setState(threadID, active, mode) {
    global.autoReactData.set(String(threadID), { active, mode: mode || "all" });
}

function doReact(api, emoji, messageID, retries = 2) {
    try {
        api.setMessageReaction(emoji, messageID, (err) => {
            if (err && retries > 0) doReact(api, emoji, messageID, retries - 1);
        }, true);
    } catch (_) {
        if (retries > 0) doReact(api, emoji, messageID, retries - 1);
    }
}

module.exports.config = {
    name: "autoreact",
    aliases: ["reactall", "ar"],
    version: "2.1.0",
    hasPermssion: 0,
    credits: "Chris st",
    description: "Réagir automatiquement aux messages - Mode tout le monde ou admin uniquement",
    usePrefix: true,
    commandCategory: "Box",
    usages: "on [admin|all] / off / status",
    cooldowns: 5,
    dependencies: {}
};

module.exports.run = async function ({ api, event, args, box }) {
    const threadID = String(event.threadID);
    const senderID = String(event.senderID || "");
    const subCmd   = (args[0] || "").toLowerCase();
    const modeArg  = (args[1] || "all").toLowerCase();
    const state    = getState(threadID);
    const prefix   = global.GoatBot?.config?.prefix || "/";

    const replyMsg = (text) => {
        if (box && box.reply) return box.reply(text);
        return api.sendMessage(text, event.threadID, event.messageID);
    };

    if (!subCmd || subCmd === "status") {
        if (!state.active) return replyMsg(`ℹ️ ${toSmallCaps("auto react est actuellement desactive.")}`);
        return replyMsg(
            `⚡ ${toSmallCaps("statut autoreact")}\n` +
            "━━━━━━━━━━━━━━━━━━━━\n" +
            `${toSmallCaps("statut")} : ON\n` +
            `${toSmallCaps("mode")}   : ${state.mode === "all" ? toSmallCaps("tout le monde") : toSmallCaps("admin uniquement")}`
        );
    }

    if (!isBotAdmin(senderID)) {
        return replyMsg(`🔒 ${toSmallCaps("seuls les administrateurs du bot peuvent modifier l'autoreact.")}`);
    }

    if (subCmd === "on") {
        const mode = modeArg === "admin" ? "admin" : "all";
        setState(threadID, true, mode);
        return replyMsg(
            `🫡⚡ ${toSmallCaps("autoreact active !")}\n` +
            `📌 ${toSmallCaps("mode")}: ${mode === "all" ? toSmallCaps("tout le monde 🎉") : toSmallCaps("admin uniquement")}\n\n` +
            `💡 ${toSmallCaps("astuces")}:\n` +
            `   ${prefix}ar on        → ${toSmallCaps("tout le monde (defaut)")}\n` +
            `   ${prefix}ar on admin  → ${toSmallCaps("admin uniquement")}`
        );
    }

    if (subCmd === "off") {
        setState(threadID, false, state.mode);
        return replyMsg(`🤕⚡ ${toSmallCaps("autoreact desactive !")}`);
    }

    return replyMsg(
        `${toSmallCaps("utilisation")}:\n` +
        `  ${prefix}ar on           → ${toSmallCaps("tout le monde")}\n` +
        `  ${prefix}ar on admin     → ${toSmallCaps("admin uniquement")}\n` +
        `  ${prefix}ar off          → ${toSmallCaps("desactiver")}\n` +
        `  ${prefix}ar status       → ${toSmallCaps("verifier le statut")}`
    );
};

module.exports.handleEvent = async function ({ event, api }) {
    if (!event?.threadID || !event?.messageID) return;

    const threadID = String(event.threadID);
    const senderID = String(event.senderID || "");
    const botID    = String(api.getCurrentUserID?.() || "");

    const state = getState(threadID);
    if (!state.active) return;
    if (senderID === botID) return;
    if (state.mode !== "all" && !isBotAdmin(senderID)) return;

    const emojiStr = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const chars    = [...emojiStr];
    const emoji    = chars[Math.floor(Math.random() * chars.length)];
    doReact(api, emoji, event.messageID);
};


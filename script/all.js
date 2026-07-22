module.exports.config = {
  name: "all",
  version: "1.0",
  role: 1,
  hasPrefix: true,
  aliases: ["tagall", "everyone"],
  description: "Tag everyone in the most annoying & funny way  🐤💨",
  usage: "all [text] | flags: --ghost --emoji --hacker --cry --spam",
  credits: "chris st",
  cooldown: 4
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs || [];

    const botID = api.getCurrentUserID();
    const members = participantIDs.filter(uid => uid !== botID);

    if (members.length === 0) {
      return api.sendMessage("Only me in this group? Nothing to tag 😭", threadID, messageID);
    }

    let text = args.join(" ").replace(/--\w+/g, '').trim() || "";
    const flags = new Set(args.filter(a => a.startsWith('--')).map(f => f.slice(2).toLowerCase()));

    if (!text) text = "@everyone get bullied rn 🚨";

    let body = text;
    const mentions = [];
    let offset = 0;

    const prefixes = ["Yo ", "Hey ", "Oi ", "Wake up ", "Target: ", "You can't hide "];
    const suffixes = [" come online", " where u at?", " reply or else", " show yourself", " stop lurking"];
    const emojis = ["💀", "😂", "🤡", "🗿", "🔥", "👻", "🪦", "😭", "🤓", "🫵", "🚨"];

    let mode = "normal";
    if (flags.has("ghost")) mode = "ghost";
    else if (flags.has("hacker")) mode = "hacker";
    else if (flags.has("cry")) mode = "cry";
    else if (flags.has("emoji") || flags.has("spam")) mode = "emoji_spam";

    let counter = 0;

    for (const uid of members) {
      let tagText = "";

      if (mode === "ghost") {
        tagText = members.length > 30 && Math.random() > 0.7 ? "👻" : `Ghost ${++counter}`;
      } else if (mode === "hacker") {
        tagText = `User_${uid.slice(-6)}`;
        body += `\n> Accessed: ${tagText} 💾`;
      } else if (mode === "cry") {
        tagText = "pls notice me I'm sad huhu 😭";
        body = body.replace("@everyone", "Guys I'm literally crying");
      } else if (mode === "emoji_spam") {
        const count = Math.floor(Math.random() * 4) + 2;
        tagText = emojis[Math.floor(Math.random() * emojis.length)].repeat(count);
      } else {
        const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
        tagText = pre + (text || "you") + suf;
      }

      mentions.push({ tag: tagText, id: uid, fromIndex: offset });
      body = body.slice(0, offset) + tagText + body.slice(offset);
      offset += tagText.length;
      counter++;
    }

    const endings = [
      "\n\nFirst reply gets god status 🔥",
      "\n\nTagged. My job here is done 😮‍💨",
      "\n\nNo reply = instant block (jk... or am I?) 🥺",
      "\n\nCya losers zzz"
    ];

    if (Math.random() > 0.5) {
      body += endings[Math.floor(Math.random() * endings.length)];
    }

    if (flags.has("emoji") || Math.random() > 0.6) {
      body += "  " + emojis.sort(() => 0.5 - Math.random()).slice(0, 4).join("");
    }

    return api.sendMessage({ body, mentions }, threadID, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ An error occurred while tagging members.", threadID, messageID);
  }
};
```I'm just a language model and can't help with that.

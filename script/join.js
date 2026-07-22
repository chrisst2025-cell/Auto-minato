module.exports.config = {
  name: "join",
  version: "1.5.0",
  role: 2,
  hasPrefix: true,
  aliases: ["boxlist", "joinbox"],
  description: "Paginated active group list and add yourself to groups",
  usage: "join",
  credits: "Chris st",
  cooldown: 10
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const perPage = 10;

  try {
    const allThreads = await api.getThreadList(50, null, ["INBOX"]);

    const groups = allThreads.filter(t => t.isGroup && t.isSubscribed);
    if (!groups.length) {
      return api.sendMessage("⚠️ Bot is not currently in any active group.", threadID, messageID);
    }

    const page = 1;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const currentGroups = groups.slice(start, end);

    let msg = `📦 | 𝙱𝙾𝚇 𝙻𝙸𝚂𝚃 (𝙿𝙰𝙶𝙴 ${page})\n\n`;
    currentGroups.forEach((g, i) => {
      msg += `${start + i + 1}. ${g.name || "Unnamed Group"}\n`;
      msg += `🆔 ${g.threadID}\n\n`;
    });

    msg += "↩️ Reply with: add 1 | add 2 5\n➡️ Or: page 2 ... to see more groups";

    return api.sendMessage(msg.trim(), threadID, (err, info) => {
      if (err) return;

      const replyObj = {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        groups,
        page,
        perPage
      };

      if (global.client && global.client.handleReply) {
        global.client.handleReply.push(replyObj);
      } else if (global.GoatBot && global.GoatBot.onReply) {
        global.GoatBot.onReply.set(info.messageID, replyObj);
      }
    }, messageID);

  } catch (e) {
    console.error("Join command error:", e);
    return api.sendMessage("❌ Failed to fetch active group list.", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { author, groups, perPage = 10 } = handleReply;

  if (event.senderID !== author) return;

  const args = event.body.trim().toLowerCase().split(/\s+/);

  // Operation page
  if (args[0] === "page") {
    const pageNum = parseInt(args[1]);
    if (isNaN(pageNum) || pageNum < 1) {
      return api.sendMessage("❌ Invalid page number.", event.threadID, event.messageID);
    }

    const start = (pageNum - 1) * perPage;
    const end = start + perPage;
    const currentGroups = groups.slice(start, end);

    if (!currentGroups.length) {
      return api.sendMessage("⚠️ No more groups found on this page.", event.threadID, event.messageID);
    }

    let msg = `📦 | 𝙱𝙾𝚇 𝙻𝙸𝚂𝚃 (𝙿𝙰𝙶𝙴 ${pageNum})\n\n`;
    currentGroups.forEach((g, i) => {
      msg += `${start + i + 1}. ${g.name || "Unnamed Group"}\n`;
      msg += `🆔 ${g.threadID}\n\n`;
    });
    msg += `↩️ Reply with: add 1 | add 2 5\n➡️ Or: page ${pageNum + 1} ... to see more groups`;

    return api.sendMessage(msg.trim(), event.threadID, (err, info) => {
      if (err) return;

      const replyObj = {
        commandName: handleReply.commandName,
        messageID: info.messageID,
        author: handleReply.author,
        groups,
        page: pageNum,
        perPage
      };

      if (global.client && global.client.handleReply) {
        global.client.handleReply.push(replyObj);
      } else if (global.GoatBot && global.GoatBot.onReply) {
        global.GoatBot.onReply.set(info.messageID, replyObj);
      }
    }, event.messageID);
  }

  // Operation add
  if (args[0] === "add") {
    const addUserToGroup = async (uid, tid, name) => {
      return new Promise((resolve) => {
        api.addUserToGroup(uid, tid, (err) => {
          if (err) {
            api.sendMessage(`❌ Failed to add you to: ${name}`, event.threadID);
          } else {
            api.sendMessage(`✅ Added you to: ${name}`, event.threadID);
          }
          resolve();
        });
      });
    };

    for (let i = 1; i < args.length; i++) {
      const index = parseInt(args[i]) - 1;
      if (isNaN(index) || index < 0 || index >= groups.length) {
        await api.sendMessage(`❌ Invalid number: ${args[i]}`, event.threadID);
        continue;
      }
      const g = groups[index];
      await addUserToGroup(event.senderID, g.threadID, g.name || "Unnamed Group");
    }
  }
};

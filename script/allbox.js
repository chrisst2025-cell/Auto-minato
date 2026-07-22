const moment = require("moment-timezone");

module.exports.config = {
  name: "allbox",
  version: "1.0.0",
  role: 2,
  hasPrefix: true,
  aliases: ["allgroup", "grouplist"],
  description: "List all groups and reply to Ban, Unban, Delete data, or remove the bot",
  usage: "allbox",
  credits: "Chris st",
  cooldown: 60
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  try {
    const dataThreads = await api.getThreadList(100, null, ["INBOX"]);
    const groups = dataThreads.filter(thread => thread.isGroup);
    if (!groups.length) return api.sendMessage("There are currently no groups!", threadID, messageID);

    // Sort groups by messageCount descending
    groups.sort((a, b) => b.messageCount - a.messageCount);

    let msg = "🎭 GROUP LIST 🎭\n\n";
    const groupid = [];
    const groupName = [];

    groups.forEach((g, i) => {
      msg += `${i + 1}. ${g.name || "No Name"}\n🔰TID: ${g.threadID}\n💌MessageCount: ${g.messageCount}\n\n`;
      groupid.push(g.threadID);
      groupName.push(g.name || "No Name");
    });

    msg += "Reply to this message with: <ban | unban | del | out> + number or 'all'";

    return api.sendMessage(msg, threadID, (err, info) => {
      if (err) return;

      const replyObj = {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        groupid,
        groupName
      };

      if (global.client && global.client.handleReply) {
        global.client.handleReply.push(replyObj);
      } else if (global.GoatBot && global.GoatBot.onReply) {
        global.GoatBot.onReply.set(info.messageID, replyObj);
      }
    }, messageID);

  } catch (error) {
    console.error("Allbox command error:", error);
    return api.sendMessage("Error fetching group list.", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply, threadsData }) {
  const { author, groupid, groupName, messageID: replyMessageID } = handleReply;
  if (event.senderID !== author) return;

  const args = event.body.trim().toLowerCase().split(" ");

  const action = args[0];
  const index = parseInt(args[1]) - 1;

  if (!["ban", "unban", "del", "out"].includes(action)) {
    return api.sendMessage("Invalid action. Use: ban, unban, del, out", event.threadID, event.messageID);
  }

  async function processGroup(act, i) {
    const idgr = groupid[i];
    const gName = groupName[i];

    if (act === "ban") {
      let threadData = {};
      if (threadsData && typeof threadsData.get === "function") {
        threadData = await threadsData.get(idgr) || {};
      }
      
      const data = threadData.data || {};
      data.banned = 1;
      data.dateAdded = moment.tz("Asia/Dhaka").format("HH:mm:ss L");

      if (threadsData && typeof threadsData.set === "function") {
        await threadsData.set(idgr, { data });
      }

      if (global.data && global.data.threadBanned) {
        global.data.threadBanned.set(idgr, { dateAdded: data.dateAdded });
      }
      api.sendMessage(`✅ Banned: ${gName}`, event.threadID);
    }

    if (act === "unban") {
      let threadData = {};
      if (threadsData && typeof threadsData.get === "function") {
        threadData = await threadsData.get(idgr) || {};
      }

      const data = threadData.data || {};
      data.banned = 0;
      data.dateAdded = null;

      if (threadsData && typeof threadsData.set === "function") {
        await threadsData.set(idgr, { data });
      }

      if (global.data && global.data.threadBanned) {
        global.data.threadBanned.delete(idgr);
      }
      api.sendMessage(`✅ Unbanned: ${gName}`, event.threadID);
    }

    if (act === "del") {
      if (threadsData && typeof threadsData.del === "function") {
        await threadsData.del(idgr);
      } else if (threadsData && typeof threadsData.delete === "function") {
        await threadsData.delete(idgr);
      }
      api.sendMessage(`✅ Data deleted: ${gName}`, event.threadID);
    }

    if (act === "out") {
      api.removeUserFromGroup(api.getCurrentUserID(), idgr, (err) => {
        if (!err) {
          api.sendMessage(`✅ Bot removed from: ${gName}`, event.threadID);
        } else {
          api.sendMessage(`❌ Failed to leave: ${gName}`, event.threadID);
        }
      });
    }
  }

  if (args[1] === "all") {
    for (let i = 0; i < groupid.length; i++) {
      await processGroup(action, i);
    }
    api.sendMessage(`✅ ${action.toUpperCase()} executed on all groups.`, event.threadID, event.messageID);
  } else {
    if (isNaN(index) || index < 0 || index >= groupid.length) {
      return api.sendMessage("Invalid number!", event.threadID, event.messageID);
    }
    await processGroup(action, index);
  }

  try {
    api.unsendMessage(replyMessageID);
  } catch (_) {}
};

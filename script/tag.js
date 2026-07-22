module.exports.config = {
  name: "tag",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["mention"],
  description: "Tag members by name, reply, or everyone",
  usage: "tag [name] [msg] | tag all [msg] | [reply] tag [msg]",
  credits: "Chris st",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args, threadsData, usersData }) {
  const { threadID, messageID, messageReply } = event;

  try {
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch (e) {
      threadInfo = null;
    }

    let members = [];

    if (threadInfo && threadInfo.userInfo) {
      members = threadInfo.userInfo.map(user => ({
        name: user.name,
        id: user.id
      }));
    } else {
      const participantIDs = threadInfo?.participantIDs || [];
      for (const id of participantIDs) {
        let name = id;
        if (usersData && typeof usersData.getName === "function") {
          try {
            name = await usersData.getName(id);
          } catch (_) {}
        }
        members.push({ name, id });
      }
    }

    let tagUsers = [];
    let text = "";

    if (messageReply) {
      const uid = messageReply.senderID;
      let name = "User";

      if (usersData && typeof usersData.getName === "function") {
        try {
          name = await usersData.getName(uid);
        } catch (_) {
          name = uid;
        }
      }

      tagUsers.push({
        name,
        id: uid
      });

      text = args.join(" ");
    } else if (
      args[0] &&
      ["all", "everyone", "cdi"].includes(args[0].toLowerCase())
    ) {
      tagUsers = members;
      text = args.slice(1).join(" ");
    } else {
      if (!args[0]) {
        return api.sendMessage(
          "⚠️ | Please mention a name, reply to a message, or use 'all'.",
          threadID,
          messageID
        );
      }

      const searchName = args[0].toLowerCase();
      text = args.slice(1).join(" ");

      tagUsers = members.filter(member =>
        member.name && member.name.toLowerCase().includes(searchName)
      );

      if (tagUsers.length === 0) {
        return api.sendMessage(
          "❌ | User Not Found.",
          threadID,
          messageID
        );
      }
    }

    const mentions = tagUsers.map(user => ({
      tag: user.name,
      id: user.id
    }));

    const namesText = tagUsers
      .map(user => `• ${user.name}`)
      .join("\n");

    const body = text
      ? `╭─ Tag Notice\n${namesText}\n├──────────\n💬 ${text}\n╰──────────`
      : `╭─ Tag Notice\n${namesText}\n╰──────────`;

    return api.sendMessage(
      {
        body,
        mentions
      },
      threadID,
      messageReply ? messageReply.messageID : messageID
    );
  } catch (error) {
    console.error("Tag command error:", error);
    return api.sendMessage(
      `❌ | Error: ${error.message}`,
      threadID,
      messageID
    );
  }
};

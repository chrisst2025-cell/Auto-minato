function checkShortCut(nickname, uid, userName) {
  if (!nickname) return "";
  if (/\{userName\}/gi.test(nickname)) nickname = nickname.replace(/\{userName\}/gi, userName);
  if (/\{userID\}/gi.test(uid) || /\{userID\}/gi.test(nickname)) nickname = nickname.replace(/\{userID\}/gi, uid);
  return nickname;
}

module.exports.config = {
  name: "autosetname",
  version: "1.3",
  role: 1,
  hasPrefix: true,
  aliases: ["setname"],
  description: "Auto change nickname of new members when they join the group",
  usage: "autosetname [set <nickname> | on | off | view]",
  credits: "Chris st",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args, threadsData }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "   autosetname set <nickname>: Set auto nickname configuration with shortcuts:\n" +
      "   + {userName}: Name of new member\n" +
      "   + {userID}: Member ID\n" +
      "   Example: autosetname set {userName} 🚀\n\n" +
      "   autosetname [on | off]: Turn on or off this feature\n\n" +
      "   autosetname [view | info]: Show current configuration",
      threadID,
      messageID
    );
  }

  const subCommand = args[0].toLowerCase();

  switch (subCommand) {
    case "set":
    case "add":
    case "config": {
      if (args.length < 2) {
        return api.sendMessage("Please enter the required configuration.", threadID, messageID);
      }
      const configAutoSetName = args.slice(1).join(" ");

      if (threadsData && typeof threadsData.set === "function") {
        await threadsData.set(threadID, { autoSetName: configAutoSetName });
      }

      return api.sendMessage("The configuration has been set successfully.", threadID, messageID);
    }

    case "view":
    case "info": {
      let configAutoSetName = null;
      if (threadsData && typeof threadsData.get === "function") {
        const data = await threadsData.get(threadID) || {};
        configAutoSetName = data.autoSetName;
      }

      return api.sendMessage(
        configAutoSetName
          ? `The current autoSetName configuration in your chat group is:\n${configAutoSetName}`
          : "Your group has not set the autoSetName configuration.",
        threadID,
        messageID
      );
    }

    case "on":
    case "off": {
      const isEnable = subCommand === "on";

      if (threadsData && typeof threadsData.set === "function") {
        await threadsData.set(threadID, { enableAutoSetName: isEnable });
      }

      return api.sendMessage(
        isEnable
          ? "The autoSetName feature has been turned on."
          : "The autoSetName feature has been turned off.",
        threadID,
        messageID
      );
    }

    default:
      return api.sendMessage('Syntax error, only "on", "off", "set", or "view" can be used.', threadID, messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, threadsData }) {
  if (event.logMessageType !== "log:subscribe") return;

  const { threadID } = event;

  let threadSettings = {};
  if (threadsData && typeof threadsData.get === "function") {
    threadSettings = await threadsData.get(threadID) || {};
  }

  if (!threadSettings.enableAutoSetName) return;

  const configAutoSetName = threadSettings.autoSetName;
  if (!configAutoSetName) return;

  const addedParticipants = event.logMessageData?.addedParticipants || [];

  for (const user of addedParticipants) {
    const uid = user.userFbId;
    const userName = user.fullName;

    try {
      const newNickname = checkShortCut(configAutoSetName, uid, userName);
      await new Promise((resolve, reject) => {
        api.changeNickname(newNickname, threadID, uid, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (e) {
      console.error("Autosetname handleEvent error:", e);
    }
  }
};

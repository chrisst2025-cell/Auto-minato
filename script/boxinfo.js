const fs = require("fs");
const request = require("request");
const path = require("path");

module.exports.config = {
  name: "boxinfo",
  version: "2.2.0",
  role: 1,
  hasPrefix: true,
  aliases: ["groupinfo", "gcinfo"],
  description: "Display group info and statistics",
  usage: "boxinfo",
  credits: "Chris st",
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const cacheDir = path.join(__dirname, "cache");
  const imgPath = path.join(cacheDir, `groupinfo_${threadID}.png`);

  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  try {
    const info = await api.getThreadInfo(threadID);

    let male = 0, female = 0;
    if (info.userInfo) {
      for (const u of info.userInfo) {
        if (u.gender === "MALE") male++;
        else if (u.gender === "FEMALE") female++;
      }
    }

    const text =
`── Gʀᴏᴜᴘ Iɴғᴏ ──
Nᴀᴍᴇ      : ${info.threadName || "No Name"}
Iᴅ        : ${info.threadID}
Eᴍᴏᴊɪ     : ${info.emoji || "N/A"}
Aᴘᴘʀᴏᴠᴀʟ  : ${info.approvalMode ? "ON" : "OFF"}

Mᴇᴍʙᴇʀs   : ${info.participantIDs ? info.participantIDs.length : 0}
Mᴀʟᴇ      : ${male}
Fᴇᴍᴀʟᴇ    : ${female}
Aᴅᴍɪɴs    : ${info.adminIDs ? info.adminIDs.length : 0}
Mᴇssᴀɢᴇs  : ${info.messageCount || 0}

— Cʜʀɪs sᴛ`;

    const send = () => {
      api.sendMessage(
        {
          body: text,
          attachment: fs.existsSync(imgPath)
            ? fs.createReadStream(imgPath)
            : null
        },
        threadID,
        () => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        },
        messageID
      );
    };

    if (!info.imageSrc) {
      return api.sendMessage(text, threadID, messageID);
    }

    request(encodeURI(info.imageSrc))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send)
      .on("error", () => {
        api.sendMessage(text, threadID, messageID);
      });

  } catch (err) {
    console.error("Boxinfo error:", err);
    return api.sendMessage("❌ Failed to get group info.", threadID, messageID);
  }
};


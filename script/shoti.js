const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'shoti',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['shoti', 'tikvid'],
  description: "Generate random Shoti",
  usage: "shoti",
  credits: 'Joshua Apostol',
  cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  api.sendMessage(
    "Shoti is sending, please wait...",
    threadID,
    (err, info) => {
      if (err) return;

      axios
        .post("https://shoti-rho.vercel.app/api/request/f")
        .then(async ({ data }) => {
          const videoUrl = data.url;
          const username = data.username;
          const nickname = data.nickname;

          const videoPath = path.resolve(__dirname, 'shoti.mp4');
          const writer = fs.createWriteStream(videoPath);

          const responseStream = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream',
          });

          responseStream.data.pipe(writer);

          writer.on('finish', () => {
            api.sendMessage(
              {
                body: `Username: ${username}\nNickname: ${nickname}`,
                attachment: fs.createReadStream(videoPath),
              },
              threadID,
              () => {
                fs.unlinkSync(videoPath);
                api.editMessage(
                  "[ Shoti ]\n\nVideo sent successfully!",
                  info.messageID
                );
              },
              messageID
            );
          });

          writer.on('error', () => {
            api.editMessage(
              "[ Shoti ]\n\nAn error occurred while processing the video.",
              info.messageID
            );
          });
        })
        .catch(() => {
          api.editMessage(
            "[ Random TikTok Girl Edit ]\n\nError fetching girl edit API!",
            info.messageID
          );
        });
    }
  );
};

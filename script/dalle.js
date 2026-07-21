const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "dalle",
    version: "1.0.0",
    credits: "Chris st",
    description: "Génère des images à partir d'une description",
    hasPrefix: false,
    cooldown: 5,
    aliases: ["dalle"]
};

module.exports.run = async function ({ api, event, args }) {
    try {
        let chilli = args.join(" ");
        if (!chilli) {
            return api.sendMessage("[ ❗ ] - 𝙿𝚛𝚘𝚖𝚙𝚝 𝚖𝚊𝚗𝚚𝚞𝚊𝚗𝚝 𝚙𝚘𝚞𝚛 𝚕𝚊 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚎 𝙳𝙰𝙻𝙻-𝙴", event.threadID, event.messageID);
        }

        api.sendMessage("𝙶𝚎́𝚗𝚎́𝚛𝚊𝚝𝚒𝚘𝚗 𝚍𝚎 𝚕'𝚒𝚖𝚊𝚐𝚎, 𝚟𝚎𝚞𝚒𝚕𝚕𝚎𝚣 𝚙𝚊𝚝𝚒𝚎𝚗𝚝𝚎𝚛...", event.threadID, async (err, info) => {
            if (err) {
                console.error(err);
                return api.sendMessage("𝚄𝚗𝚎 𝚎𝚛𝚛𝚎𝚞𝚛 𝚎𝚜𝚝 𝚜𝚞𝚛𝚟𝚎𝚗𝚞𝚎 𝚕𝚘𝚛𝚜 𝚍𝚞 𝚝𝚛𝚊𝚒𝚝𝚎𝚖𝚎𝚗𝚝 𝚍𝚎 𝚟𝚘𝚝𝚛𝚎 𝚍𝚎𝚖𝚊𝚗𝚍𝚎.", event.threadID, event.messageID);
            }

            try {
                const pogi = await axios.get(`https://joshweb.click/dalle?prompt=${encodeURIComponent(chilli)}`, { responseType: 'arraybuffer' });
                const imagePath = path.join(__dirname, "dalle_image.png");
                
                fs.writeFileSync(imagePath, pogi.data);

                const poganda = await api.getUserInfo(event.senderID);
                const requesterName = poganda[event.senderID].name;

                api.sendMessage({
                    body: `𝚅𝚘𝚒𝚌𝚒 𝚕'𝚒𝚖𝚊𝚐𝚎 𝚍𝚎𝚖𝚊𝚗𝚍𝚎́𝚎 :\n\n𝙿𝚛𝚘𝚖𝚙𝚝 : ${chilli}\n\n𝙳𝚎𝚖𝚊𝚗𝚍𝚎́ 𝚙𝚊𝚛 : ${requesterName}`,
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID, () => {
                    fs.unlinkSync(imagePath);
                }, event.messageID);
            } catch (mantika) {
                console.error(mantika);
                api.sendMessage("𝚄𝚗𝚎 𝚎𝚛𝚛𝚎𝚞𝚛 𝚎𝚜𝚝 𝚜𝚞𝚛𝚟𝚎𝚗𝚞𝚎 𝚕𝚘𝚛𝚜 𝚍𝚞 𝚝𝚛𝚊𝚒𝚝𝚎𝚖𝚎𝚗𝚝 𝚍𝚎 𝚟𝚘𝚝𝚛𝚎 𝚍𝚎𝚖𝚊𝚗𝚍𝚎.", event.threadID, event.messageID);
            }
        });
    } catch (mantika) {
        console.error("Erreur commande DALL-E :", mantika);
        api.sendMessage("𝚄𝚗𝚎 𝚎𝚛𝚛𝚎𝚞𝚛 𝚎𝚜𝚝 𝚜𝚞𝚛𝚟𝚎𝚗𝚞𝚎 𝚕𝚘𝚛𝚜 𝚍𝚞 𝚝𝚛𝚊𝚒𝚝𝚎𝚖𝚎𝚗𝚝 𝚍𝚎 𝚟𝚘𝚝𝚛𝚎 𝚍𝚎𝚖𝚊𝚗𝚍𝚎.", event.threadID, event.messageID);
    }
};

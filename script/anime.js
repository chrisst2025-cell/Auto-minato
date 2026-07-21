const axios = require('axios');
const fs = require('fs');

module.exports.config = {
  name: 'anime',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['hanime'],
  description: 'Obtenir une image d\'anime aléatoire',
  usage: "anime sfw - [type]",
  credits: 'Chris st',
  cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
  try {
    const input = args.join(' ');
    if (!input) {
      const message = `☘️ 𝚅𝚘𝚒𝚌𝚒 𝚕𝚊 𝚕𝚒𝚜𝚝𝚎 𝚍𝚎𝚜 𝚌𝚊𝚝𝚎́𝚐𝚘𝚛𝚒𝚎𝚜 𝚍'𝚊𝚗𝚒𝚖𝚎 :\n\n𝙲𝚊𝚝𝚎́𝚐𝚘𝚛𝚒𝚎 : sfw\n𝚃𝚢𝚙𝚎 :\n• waifu\n• neko\n• shinobu\n• megumin\n• bully\n• cuddle\n• cry\n• hug\n• awoo\n• kiss\n• lick\n• pat\n• smug\n• bonk\n• yeet\n• blush\n• smile\n• wave\n• highfive\n• handhold\n• nom\n• bite\n• glomp\n• slap\n• kill\n• kick\n• happy\n• wink\n• poke\n• dance\n• cringe\n\n𝚄𝚝𝚒𝚕𝚒𝚜𝚊𝚝𝚒𝚘𝚗 : anime sfw - type`;
      api.sendMessage(message, event.threadID, event.messageID);
    } else {
      const split = input.split('-').map(item => item.trim());
      const choice = split[0];
      const category = split[1];
      const time = new Date();
      const timestamp = time.toISOString().replace(/[:.]/g, "-");
      const pathPic = __dirname + '/cache/' + `${timestamp}_waifu.png`;
      
      const { data } = await axios.get(`https://api.waifu.pics/${choice}/${category}`);
      const picture = data.url;
      const getPicture = (await axios.get(picture, { responseType: 'arraybuffer' })).data;
      
      fs.writeFileSync(pathPic, Buffer.from(getPicture, 'utf-8'));
      api.sendMessage({
        body: '',
        attachment: fs.createReadStream(pathPic)
      }, event.threadID, () => fs.unlinkSync(pathPic), event.messageID);
    }
  } catch (error) {
    api.sendMessage(`🔴 𝙴𝚛𝚛𝚎𝚞𝚛 𝚍𝚊𝚗𝚜 𝚕𝚊 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚎 𝚊𝚗𝚒𝚖𝚎 : ${error.message}`, event.threadID, event.messageID);
  }
};
                          

const fs = require('fs-extra');
const pathFile = __dirname + '/cache/autoseen.txt';

module.exports.config = {
	name: "autoseen",
	version: "1.0.0",
	role: 2,
	credits: "Chris st",
	description: "Active ou désactive le vu automatique lors de la réception de nouveaux messages",
	aliases: ["seen"],
	cooldown: 0,
	hasPrefix: false,
	usage: "[on / off]",
};

module.exports.handleEvent = async ({ api, event, args }) => {
	if (!fs.existsSync(pathFile))
		fs.writeFileSync(pathFile, 'false');
	
	const isEnable = fs.readFileSync(pathFile, 'utf-8');
	if (isEnable == 'true')
		api.markAsReadAll(() => {});
};

module.exports.run = async ({ api, event, args }) => {
	try {
		if (args[0] == 'on') {
			fs.writeFileSync(pathFile, 'true');
			api.sendMessage('𝙻𝚊 𝚏𝚘𝚗𝚌𝚝𝚒𝚘𝚗 𝚅𝚞 𝙰𝚞𝚝𝚘𝚖𝚊𝚝𝚒𝚚𝚞𝚎 𝚎𝚜𝚝 𝚍𝚎́𝚜𝚘𝚛𝚖𝚊𝚒𝚜 𝚊𝚌𝚝𝚒𝚟𝚎́𝚎.', event.threadID, event.messageID);
		} else if (args[0] == 'off') {
			fs.writeFileSync(pathFile, 'false');
			api.sendMessage('𝙻𝚊 𝚏𝚘𝚗𝚌𝚝𝚒𝚘𝚗 𝚅𝚞 𝙰𝚞𝚝𝚘𝚖𝚊𝚝𝚒𝚚𝚞𝚎 𝚊 𝚎́𝚝𝚎́ 𝚍𝚎́𝚜𝚊𝚌𝚝𝚒𝚟𝚎́𝚎.', event.threadID, event.messageID);
		} else {
			api.sendMessage('𝚂𝚢𝚗𝚝𝚊𝚡𝚎 𝚒𝚗𝚌𝚘𝚛𝚛𝚎𝚌𝚝𝚎. 𝚄𝚝𝚒𝚕𝚒𝚜𝚎𝚣 : 𝚊𝚞𝚝𝚘𝚜𝚎𝚎𝚗 𝚘𝚗 / 𝚊𝚞𝚝𝚘𝚜𝚎𝚎𝚗 𝚘𝚏𝚏', event.threadID, event.messageID);
		}
	}
	catch(e) {
		console.log(e);
	}
};

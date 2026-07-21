const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const smallCapsMap = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ',
  g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
  m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
  s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ'
};

const toSmallCaps = t =>
  (t || "").toLowerCase().split("").map(c => smallCapsMap[c] || c).join("");

module.exports.config = {
	name: "sendnoti",
	version: "1.1.0",
	role: 2,
	description: "Envoie une notification à tous les groupes (Réservé aux admins).",
	credits: "Chris st",
	hasPrefix: false,
	aliases: ["noti"],
	usages: "[Texte]",
	cooldown: 0,
};

module.exports.run = async function ({ api, event, args, admin }) {
	const threadList = await api.getThreadList(100, null, ["INBOX"]);
	let sentCount = 0;
	const custom = args.join(" ");

	if (!custom) {
		return api.sendMessage(
			toSmallCaps("Veuillez entrer un message à envoyer."),
			event.threadID,
			event.messageID
		);
	}

	async function sendMessage(thread) {
		try {
			await api.sendMessage(
`minato namikaze [🌐]\n━━━━━━━━━━━\n [${custom}]\n⚘⊰♔⊱⊰⊹⊱♡⊰⊹⊱♡⊰⊹⊱♡⊰⊹\n〉`,
				thread.threadID
			);
			sentCount++;

			const content = `${custom}`;
			const languageToSay = "fr"; 
			const pathFemale = path.resolve(__dirname, "cache", `${thread.threadID}_female.mp3`);

			await downloadFile(
				`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(content)}&tl=${languageToSay}&client=tw-ob&idx=1`,
				pathFemale
			);
			api.sendMessage(
				{ attachment: fs.createReadStream(pathFemale) },
				thread.threadID,
				() => fs.unlinkSync(pathFemale)
			);
		} catch (error) {
			console.error("Error sending a message:", error);
		}
	}

	for (const thread of threadList) {
		if (sentCount >= 20) {
			break;
		}
		if (thread.isGroup && thread.name != thread.threadID && thread.threadID != event.threadID) {
			await sendMessage(thread);
		}
	}

	if (sentCount > 0) {
		api.sendMessage(
			toSmallCaps("Notification envoyée avec succès."),
			event.threadID,
			event.messageID
		);
	} else {
		api.sendMessage(
			toSmallCaps("Aucun groupe éligible trouvé pour envoyer le message."),
			event.threadID,
			event.messageID
		);
	}
};

async function downloadFile(url, filePath) {
	const writer = fs.createWriteStream(filePath);
	const response = await axios({
		url,
		method: 'GET',
		responseType: 'stream'
	});
	response.data.pipe(writer);
	return new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});
}

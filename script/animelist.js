const axios = require("axios");

module.exports.config = {
	name: "animelist",
	version: "1.0.0",
	credits: "Chris",
	role: 0,
	description: "Afficher la liste des personnages anime",
	hasPrefix: false,
	aliases: ["anime"],
	usage: "animelist",
	cooldown: 5
};

module.exports.run = async function ({ api, event }) {
	try {
		const res = await axios.get(
			"https://christ-apis-multiples3.vercel.app/info/AnimeList"
		);

		const list = res.data.anime_List;

		if (!list || list.length === 0) {
			return api.sendMessage(
				"❌ Aucune liste trouvée.",
				event.threadID,
				event.messageID
			);
		}

		let msg = "🎌 Anime List\n\n";

		list.slice(0, 30).forEach((anime) => {
			msg += `ID: ${anime.ID}\n`;
			msg += `👤 ${anime.name}\n`;
			msg += `🎬 ${anime.movie}\n`;
			msg += `🎨 ${anime.colorBg}\n\n`;
		});

		msg += `📌 Total : ${list.length} personnages`;

		api.sendMessage(
			msg,
			event.threadID,
			event.messageID
		);

	} catch (error) {
		console.log(error.response?.data || error.message);

		api.sendMessage(
			"❌ Erreur lors de la récupération de la liste.",
			event.threadID,
			event.messageID
		);
	}
};

const axios = require("axios");

module.exports.config = {
	name: "animerandom",
	version: "1.0.0",
	credits: "Chris",
	role: 0,
	description: "Envoyer un personnage anime aléatoire",
	hasPrefix: false,
	aliases: ["arandom", "anime"],
	usage: "animerandom",
	cooldown: 5
};

module.exports.run = async function ({ api, event }) {
	try {
		const res = await axios.get(
			"https://christ-apis-multiples3.vercel.app/info/AnimeRandom"
		);

		const anime = res.data.random;

		if (!anime || !anime.imgAnime) {
			return api.sendMessage(
				"❌ Aucun personnage trouvé.",
				event.threadID,
				event.messageID
			);
		}

		const image = await axios.get(anime.imgAnime, {
			responseType: "stream"
		});

		const message = 
`🎌 Anime Random

👤 Nom : ${anime.name}
🎬 Anime : ${anime.movie}
🆔 ID : ${anime.ID}
🎨 Couleur : ${anime.colorBg}`;

		api.sendMessage(
			{
				body: message,
				attachment: image.data
			},
			event.threadID,
			event.messageID
		);

	} catch (error) {
		console.log(error.response?.data || error.message);

		api.sendMessage(
			"❌ Erreur lors de la récupération du personnage.",
			event.threadID,
			event.messageID
		);
	}
};

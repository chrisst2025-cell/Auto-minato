const axios = require("axios");

module.exports.config = {
	name: "cosplay",
	version: "1.0.0",
	credits: "Chris",
	role: 0,
	description: "Envoyer un cosplay vidéo aléatoire",
	hasPrefix: false,
	aliases: ["cos"],
	usage: "cosplay",
	cooldown: 5
};

module.exports.run = async function ({ api, event }) {
	try {
		const res = await axios.get(
			"https://christ-apis-multiples3.vercel.app/random/cosplay"
		);

		const videoUrl = res.data.videoUrl;

		if (!videoUrl) {
			return api.sendMessage(
				"❌ Aucune vidéo trouvée.",
				event.threadID,
				event.messageID
			);
		}

		const video = await axios.get(videoUrl, {
			responseType: "stream"
		});

		api.sendMessage(
			{
				body: "🎭 Cosplay random",
				attachment: video.data
			},
			event.threadID,
			event.messageID
		);

	} catch (error) {
		console.log(error.response?.data || error.message);

		api.sendMessage(
			"❌ Erreur lors de la récupération de la vidéo.",
			event.threadID,
			event.messageID
		);
	}
};

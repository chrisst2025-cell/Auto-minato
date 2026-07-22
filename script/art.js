const axios = require("axios");

module.exports.config = {
	name: "art",
	version: "1.0.0",
	credits: "Chris",
	role: 0,
	description: "Envoyer une image art aléatoire",
	hasPrefix: false,
	aliases: ["imageart"],
	usage: "art",
	cooldown: 5
};

module.exports.run = async function ({ api, event }) {
	try {
		const response = await axios.get(
			"https://christ-apis-multiples3.vercel.app/image/art"
		);

		let imageUrl;

		if (typeof response.data === "string") {
			imageUrl = response.data;
		} else {
			imageUrl = response.data.url || response.data.image;
		}

		if (!imageUrl) {
			return api.sendMessage(
				"❌ L'API n'a pas retourné d'image.",
				event.threadID,
				event.messageID
			);
		}

		const image = await axios.get(imageUrl, {
			responseType: "stream"
		});

		api.sendMessage(
			{
				body: "🎨 Art aléatoire",
				attachment: image.data
			},
			event.threadID,
			event.messageID
		);

	} catch (error) {
		console.log(error.response?.data || error.message);

		api.sendMessage(
			"❌ Erreur lors de la récupération de l'image.",
			event.threadID,
			event.messageID
		);
	}
};

const axios = require("axios");

module.exports.config = {
	name: "bluearchive",
	version: "1.0.0",
	credits: "Chris",
	role: 0,
	description: "Envoyer une image Blue Archive aléatoire",
	hasPrefix: false,
	aliases: ["blue", "ba"],
	usage: "bluearchive",
	cooldown: 5
};

module.exports.run = async function ({ api, event }) {
	try {
		const res = await axios.get(
			"https://christ-apis-multiples3.vercel.app/random/bluearchive"
		);

		let imageUrl;

		// Si l'API renvoie directement un lien
		if (typeof res.data === "string") {
			imageUrl = res.data;
		} 
		// Si elle renvoie un JSON
		else {
			imageUrl = res.data.url || res.data.image || res.data.answer?.url;
		}

		if (!imageUrl) {
			return api.sendMessage(
				"❌ Aucune image trouvée.",
				event.threadID,
				event.messageID
			);
		}

		const image = await axios.get(imageUrl, {
			responseType: "stream"
		});

		api.sendMessage(
			{
				body: "💙 Blue Archive random",
				attachment: image.data
			},
			event.threadID,
			event.messageID
		);

	} catch (err) {
		console.log(err.response?.data || err.message);

		api.sendMessage(
			"❌ Erreur lors de la récupération de l'image.",
			event.threadID,
			event.messageID
		);
	}
};

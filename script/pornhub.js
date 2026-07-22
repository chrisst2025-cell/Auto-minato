const axios = require("axios");

module.exports.config = {
	name: "pornhub",
	version: "1.0.0",
	credits: "Chris",
	role: 0,
	description: "Créer une image avec deux textes",
	hasPrefix: false,
	aliases: ["ph"],
	usage: "pornhub <texte1> | <texte2>",
	cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
	try {
		if (!args[0]) {
			return api.sendMessage(
				"❌ Utilisation : ph texte1 | texte2",
				event.threadID,
				event.messageID
			);
		}

		const text = args.join(" ").split("|");

		const text1 = encodeURIComponent(text[0].trim());
		const text2 = encodeURIComponent(text[1]?.trim() || "");

		const url = `https://christ-apis-multiples3.vercel.app/image/pornhub?text1=${text1}&text2=${text2}`;

		const image = await axios.get(url, {
			responseType: "stream"
		});

		api.sendMessage(
			{
				body: "✅ Image créée",
				attachment: image.data
			},
			event.threadID,
			event.messageID
		);

	} catch (err) {
		console.log(err);
		api.sendMessage(
			"❌ Erreur lors de la création de l'image.",
			event.threadID,
			event.messageID
		);
	}
};

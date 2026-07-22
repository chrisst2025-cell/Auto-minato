const axios = require("axios");

module.exports.config = {
	name: "bgremover",
	version: "1.0.0",
	credits: "Chris",
	role: 0,
	description: "Supprimer le fond d'une image",
	hasPrefix: false,
	aliases: ["removebg", "bg"],
	usage: "bgremover <lien image>",
	cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
	try {
		const imageUrl = args.join(" ");

		if (!imageUrl) {
			return api.sendMessage(
				"❌ Envoie le lien d'une image.\nExemple : bg https://image.com/photo.jpg",
				event.threadID,
				event.messageID
			);
		}

		api.sendMessage(
			"⏳ Suppression du fond en cours...",
			event.threadID
		);

		const res = await axios.get(
			"https://christ-apis-multiples3.vercel.app/tools/bgremover",
			{
				params: {
					imageUrl: imageUrl
				},
				responseType: "stream"
			}
		);

		api.sendMessage(
			{
				body: "✅ Fond supprimé",
				attachment: res.data
			},
			event.threadID,
			event.messageID
		);

	} catch (error) {
		console.log(error.response?.data || error.message);

		api.sendMessage(
			"❌ Erreur pendant la suppression du fond.",
			event.threadID,
			event.messageID
		);
	}
};

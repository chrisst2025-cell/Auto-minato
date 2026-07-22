const axios = require("axios");

module.exports.config = {
	name: "fbdl",
	version: "1.0.0",
	credits: "Chris",
	role: 0,
	description: "Télécharger une vidéo Facebook",
	hasPrefix: false,
	aliases: ["facebook", "fb"],
	usage: "fbdl <lien Facebook>",
	cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
	try {
		const link = args.join(" ");

		if (!link || !link.includes("facebook.com")) {
			return api.sendMessage(
				"❌ Envoie un lien vidéo Facebook valide.",
				event.threadID,
				event.messageID
			);
		}

		api.sendMessage(
			"⏳ Téléchargement de la vidéo en cours...",
			event.threadID
		);

		const res = await axios.get(
			`https://christ-apis-multiples3.vercel.app/downloader/fbdl`,
			{
				params: {
					url: link
				}
			}
		);

		const data = res.data.answer;

		if (!data || !data.url) {
			return api.sendMessage(
				"❌ Impossible de récupérer la vidéo.",
				event.threadID,
				event.messageID
			);
		}

		const video = await axios.get(data.url, {
			responseType: "stream"
		});

		api.sendMessage(
			{
				body: `🎬 Vidéo Facebook téléchargée\n\n${data.title || ""}`,
				attachment: video.data
			},
			event.threadID,
			event.messageID
		);

	} catch (error) {
		console.log(error.response?.data || error.message);

		api.sendMessage(
			"❌ Erreur pendant le téléchargement.",
			event.threadID,
			event.messageID
		);
	}
};

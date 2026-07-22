const axios = require("axios");

module.exports.config = {
	name: "mal",
	version: "1.0.0",
	credits: "Chris",
	role: 0,
	description: "Rechercher les informations d'un anime sur MAL",
	hasPrefix: false,
	aliases: ["myanimelist"],
	usage: "mal <nom anime>",
	cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
	try {
		const title = args.join(" ");

		if (!title) {
			return api.sendMessage(
				"❌ Exemple : mal Naruto",
				event.threadID,
				event.messageID
			);
		}

		const res = await axios.get(
			"https://christ-apis-multiples3.vercel.app/info/MAL",
			{
				params: {
					title: title
				}
			}
		);

		const anime = res.data;

		if (!anime.status) {
			return api.sendMessage(
				"❌ Anime introuvable.",
				event.threadID,
				event.messageID
			);
		}

		let msg = 
`🎌 ${anime.title}

🇯🇵 Japonais : ${anime.japanese || "N/A"}

🎬 Type : ${anime.type}
📺 Épisodes : ${anime.episodes}
⏱ Durée : ${anime.duration}

⭐ Score : ${anime.score}
🏆 Rang : ${anime.ranked}
🔥 Popularité : ${anime.popularity}

🎭 Genres : ${anime.genres}

🏢 Studio : ${anime.studios}

📅 Sortie : ${anime.aired}

📝 Description :
${anime.description}

🔗 MAL :
${anime.url}`;

		const image = await axios.get(anime.picture, {
			responseType: "stream"
		});

		api.sendMessage(
			{
				body: msg,
				attachment: image.data
			},
			event.threadID,
			event.messageID
		);

	} catch (error) {
		console.log(error.response?.data || error.message);

		api.sendMessage(
			"❌ Erreur pendant la recherche MAL.",
			event.threadID,
			event.messageID
		);
	}
};

const axios = require("axios");

module.exports.config = {
  name: "countryinfo",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["country", "pays"],
  description: "Obtenir des informations sur un pays spécifié",
  usage: "{pn} <nom du pays>",
  credits: "Lahatra (adapté par Chris)",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ").trim();

  if (!query) {
    return api.sendMessage("⚠️ Veuillez indiquer le nom d'un pays.\nExemple : countryinfo France", threadID, messageID);
  }

  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`);

    if (response.data && response.data.length > 0) {
      const country = response.data[0];

      const name = country.name?.common || "Non disponible";
      const officialName = country.name?.official || name;
      const capital = country.capital ? country.capital.join(", ") : "Non disponible";
      const population = country.population ? country.population.toLocaleString() : "Non disponible";
      const languages = country.languages ? Object.values(country.languages).join(", ") : "Non disponible";
      const region = country.region || "Non disponible";
      const subregion = country.subregion || "Non disponible";
      const flag = country.flag || "🏳️";

      const message = `${flag} 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻𝘀 𝘀𝘂𝗿 𝗹𝗲 𝗽𝗮𝘆𝘀 : ${name}\n` +
        `-----------------------------------\n` +
        `📌 𝗡𝗼𝗺 𝗼𝗳𝗳𝗶𝗰𝗶𝗲𝗹 : ${officialName}\n` +
        `🏛️ 𝗖𝗮𝗽𝗶𝘁𝗮𝗹𝗲 : ${capital}\n` +
        `👨‍👩‍👧‍👦 𝗣𝗼𝗽𝘂𝗹𝗮𝘁𝗶𝗼𝗻 : ${population} habitants\n` +
        `🗣️ 𝗟𝗮𝗻𝗴𝘂𝗲(𝘀) : ${languages}\n` +
        `🌍 𝗥𝗲́𝗴𝗶𝗼𝗻 : ${region} (${subregion})`;

      return api.sendMessage(message, threadID, messageID);
    } else {
      return api.sendMessage("❌ Aucun pays correspondant à votre recherche n'a été trouvé.", threadID, messageID);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return api.sendMessage("❌ Aucun pays correspondant à ce nom n'a été trouvé.", threadID, messageID);
    }
    console.error("Erreur countryinfo:", error.message);
    return api.sendMessage("⚠️ Une erreur est survenue lors de la récupération des informations du pays.", threadID, messageID);
  }
};

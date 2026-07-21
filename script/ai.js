const axios = require("axios");

// Objet pour stocker l'historique des conversations par threadID
// Structure : { threadID: [ { role: "user"|"ai", text: "...", timestamp: Date } ] }
const chatHistory = {};

// Durée de conservation : 4 jours en millisecondes
const MEMORY_DURATION = 4 * 24 * 60 * 60 * 1000; 

function cleanOldHistory() {
    const now = Date.now();
    for (const threadID in chatHistory) {
        // Filtrer pour ne garder que les messages de moins de 4 jours
        chatHistory[threadID] = chatHistory[threadID].filter(msg => (now - msg.timestamp) < MEMORY_DURATION);
        // Si plus aucun message, on supprime la clé
        if (chatHistory[threadID].length === 0) {
            delete chatHistory[threadID];
        }
    }
}

function convertToBoldUnicode(text) {
    if (!text) return "";
    const normalChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const boldChars   = "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗";

    return text.replace(/\*(.*?)\*/g, (match, words) => {
        return words.split("").map(char => {
            const index = normalChars.indexOf(char);
            return index !== -1 ? boldChars.substring(index * 2, (index * 2) + 2) : char;
        }).join("");
    });
}

module.exports.config = {
    name: 'minato',
    version: '3.3.0',
    role: 0,
    hasPrefix: false,
    description: "An AI command powered by Minato API with memory",
    usage: "minato [prompt]",
    credits: 'Chris st',
    cooldown: 3,
};

module.exports.run = async function({
    api,
    event,
    args
}) {
    const query = args.join(' ');
    const { threadID, messageID } = event;

    if (!query) {
        api.sendMessage("Dis-moi, quelle est ta question ?", threadID, messageID);
        return;
    }

    try {
        // Optionnel : Ajoute une réaction si la fonction existe sur ton bot
        if (typeof api.setMessageReaction === "function") {
            api.setMessageReaction("⏳", messageID, () => {}, true);
        }

        // Nettoyage régulier de la mémoire globale
        cleanOldHistory();

        // Initialiser l'historique du thread s'il n'existe pas
        if (!chatHistory[threadID]) {
            chatHistory[threadID] = [];
        }

        // Ajouter la nouvelle question à l'historique local
        chatHistory[threadID].push({ role: "user", text: query, timestamp: Date.now() });

        // Construire le prompt avec l'historique pour l'API
        const recentMessages = chatHistory[threadID].slice(-10);
        let fullPrompt = "Voici l'historique de notre conversation :\n";
        
        recentMessages.forEach(msg => {
            fullPrompt += `${msg.role === "user" ? "Utilisateur" : "IA"}: ${msg.text}\n`;
        });
        fullPrompt += "Réponds à la dernière réplique de l'Utilisateur de manière fluide.";

        // Appel à l'API
        const res = await axios.get(`https://minatoapi.vercel.app/api/gpt?q=${encodeURIComponent(fullPrompt)}`);
        const aiText = res.data.message;

        if (!aiText) {
            if (typeof api.setMessageReaction === "function") api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("L'API n'a pas renvoyé de réponse.", threadID, messageID);
            return;
        }

        // Détection d'une éventuelle image au format Markdown ![alt](url)
        const imageRegex = /!\[.*?\]\((.*?)\)/;
        const match = aiText.match(imageRegex);

        let cleanText = aiText;
        let imageUrl = null;

        if (match && match[1]) {
            imageUrl = match[1];
            cleanText = aiText.replace(imageRegex, "").trim();
        }

        // Ajout de la réponse nettoyée à l'historique
        chatHistory[threadID].push({ role: "ai", text: cleanText, timestamp: Date.now() });

        if (imageUrl) {
            let formattedText = convertToBoldUnicode(cleanText);
            const stream = await axios.get(imageUrl, { responseType: "stream" });

            if (typeof api.setMessageReaction === "function") api.setMessageReaction("✅", messageID, () => {}, true);
            api.sendMessage({
                body: formattedText || "Voici votre image :",
                attachment: stream.data
            }, threadID, messageID);
        } else {
            const formattedResponse = convertToBoldUnicode(aiText);
            
            if (typeof api.setMessageReaction === "function") api.setMessageReaction("✅", messageID, () => {}, true);
            api.sendMessage(formattedResponse, threadID, messageID);
        }

    } catch (error) {
        console.error("Erreur commande Minato:", error);
        if (typeof api.setMessageReaction === "function") api.setMessageReaction("❌", messageID, () => {}, true);
        api.sendMessage("🔥(｡>﹏<｡)🔥😓 Désolé, une erreur s'est produite lors de la connexion à l'API.", threadID, messageID);
    }
};
      

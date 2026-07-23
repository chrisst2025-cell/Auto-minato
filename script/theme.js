const axios = require("axios");

module.exports.config = {
  name: "theme",
  version: "2.0",
  role: 1, // Réservé aux admins du groupe/bot
  hasPrefix: true,
  aliases: ["aitheme", "changetheme"],
  description: "Créer et appliquer des thèmes IA pour le groupe de discussion avec aperçu",
  usage: "{pn} <description> | {pn} apply <ID> | {pn} id",
  credits: "Neoaz ゐ (adapté par Chris)",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args, prefix }) {
  const { threadID, messageID, senderID } = event;
  const command = args[0]?.toLowerCase();

  // 1. Obtenir l'ID du thème actuel
  if (command === "id") {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const themeId = threadInfo?.threadTheme?.id || threadInfo?.color || "Inconnu";
      return api.sendMessage(`🎨 ID du thème actuel : ${themeId}`, threadID, messageID);
    } catch (error) {
      return api.sendMessage(`❌ Erreur : ${error.message || error}`, threadID, messageID);
    }
  }

  // 2. Appliquer directement un thème par son ID
  if (command === "apply" || command === "set") {
    const themeId = args[1];

    if (!themeId) {
      return api.sendMessage(
        `⚠️ Veuillez fournir un ID de thème.\nExemple : ${prefix}theme apply 739785333579430`,
        threadID,
        messageID
      );
    }

    try {
      api.sendMessage(`🎨 Application du thème ID: ${themeId}...`, threadID, messageID);
      await api.changeThreadColor(themeId, threadID);
      return api.sendMessage(`✅ Thème ID ${themeId} appliqué avec succès !`, threadID, messageID);
    } catch (error) {
      return api.sendMessage(`❌ Erreur lors de l'application du thème : ${error.message || error}`, threadID, messageID);
    }
  }

  const prompt = args.join(" ");

  // 3. Si aucun argument : Afficher les détails du thème actuel
  if (!prompt) {
    try {
      api.sendMessage("🔍 Récupération des informations du thème actuel...", threadID, messageID);

      const threadInfo = await api.getThreadInfo(threadID);
      const theme = threadInfo.threadTheme;

      if (!theme) {
        return api.sendMessage("ℹ️ Ce groupe utilise le thème par défaut.", threadID, messageID);
      }

      const themeId = theme.id || theme.theme_fbid || "Inconnu";
      const colorInfo = threadInfo.color || theme.accessibility_label || "Inconnu";

      return api.sendMessage(
        `🎨 Thème actuel du groupe :\n\n📌 ID du Thème : ${themeId}\n🎨 Couleur / Nom : ${colorInfo}\n\n> Utilise "${prefix}theme apply <ID>" pour changer le thème.`,
        threadID,
        messageID
      );
    } catch (error) {
      return api.sendMessage(`❌ Erreur : ${error.message || error}`, threadID, messageID);
    }
  }

  // 4. Générer des thèmes IA via l'API Messenger/FCA
  try {
    api.sendMessage("🎨 Génération des thèmes IA en cours, veuillez patienter...", threadID, messageID);

    if (typeof api.createAITheme !== "function") {
      return api.sendMessage("❌ Votre version de FCA ne supporte pas la fonction createAITheme.", threadID, messageID);
    }

    const themes = await api.createAITheme(prompt, 5);

    if (!themes || themes.length === 0) {
      return api.sendMessage("⚠️ Impossible de générer des thèmes avec cette description. Essayez d'autres mots.", threadID, messageID);
    }

    let themeList = "";
    const attachments = [];

    const extractUrl = (obj) => {
      if (!obj) return null;
      if (typeof obj === "string") return obj;
      return obj.uri || obj.url || null;
    };

    for (let index = 0; index < themes.length; index++) {
      const theme = themes[index];
      let colorInfo = "Généré par IA";

      if (theme.accessibility_label) {
        colorInfo = theme.accessibility_label;
      } else if (theme.gradient_colors && theme.gradient_colors.length > 0) {
        colorInfo = theme.gradient_colors.join(" → ");
      } else if (theme.primary_color) {
        colorInfo = theme.primary_color;
      }

      themeList += `${index + 1}. ID : ${theme.id}\n   Couleur : ${colorInfo}\n\n`;

      // Récupération des aperçus
      let imgUrl = null;
      if (theme.preview_image_urls) {
        imgUrl = extractUrl(theme.preview_image_urls.light_mode) || extractUrl(theme.preview_image_urls.dark_mode);
      }
      if (!imgUrl && theme.background_asset?.image) {
        imgUrl = extractUrl(theme.background_asset.image);
      }

      if (imgUrl) {
        try {
          const res = await axios.get(imgUrl, { responseType: "stream" });
          attachments.push(res.data);
        } catch (_) {}
      }
    }

    const replyBody = `✨ ${themes.length} Thème(s) IA Généré(s) !\n\nDescription : ${prompt}\n\n${themeList.trim()}\n\n👉 Répondez à ce message avec le numéro correspondant (1-${themes.length}) pour appliquer le thème.`;

    return api.sendMessage(
      {
        body: replyBody,
        attachment: attachments.length > 0 ? attachments : undefined
      },
      threadID,
      (err, info) => {
        if (err || !info) return;

        if (!global.client) global.client = {};
        if (!global.client.handleReply) global.client.handleReply = [];

        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          themes: themes
        });
      },
      messageID
    );

  } catch (error) {
    return api.sendMessage(`❌ Erreur lors de la création : ${error.message || error}`, threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { author, themes, messageID } = handleReply;
  const { threadID, senderID, body } = event;

  if (senderID !== author) {
    return api.sendMessage("⚠️ Seule la personne ayant demandé le thème peut en choisir un.", threadID, event.messageID);
  }

  const selection = parseInt(body.trim());

  if (isNaN(selection) || selection < 1 || selection > themes.length) {
    return api.sendMessage(`⚠️ Veuillez entrer un numéro valide entre 1 et ${themes.length}.`, threadID, event.messageID);
  }

  const selectedTheme = themes[selection - 1];

  try {
    api.sendMessage("🎨 Application du thème sélectionné...", threadID, event.messageID);
    await api.changeThreadColor(selectedTheme.id, threadID);

    api.unsendMessage(messageID);
    return api.sendMessage(`✅ Le thème ID "${selectedTheme.id}" a été appliqué avec succès !`, threadID, event.messageID);
  } catch (error) {
    return api.sendMessage(`❌ Erreur lors de l'application : ${error.message || error}`, threadID, event.messageID);
  }
};


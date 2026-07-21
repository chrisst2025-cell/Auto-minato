"use strict";
const axios   = require("axios");
const cheerio = require("cheerio");
const path    = require("path");
const fs      = require("fs-extra");

const CACHE_DIR = path.join(process.cwd(), "core/database/cache/cover");
fs.ensureDirSync(CACHE_DIR);

const smallCapsMap = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ',
  g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
  m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
  s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ'
};

const toSmallCaps = t =>
  (t || "").toLowerCase().split("").map(c => smallCapsMap[c] || c).join("");

module.exports.config = {
  name: "pp",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["coverpp", "pfp"],
  description: "Obtenir la photo de couverture et de profil Facebook",
  usage: "pp [@mention / UID]",
  credits: "Chris st",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  let uid;
  if (Object.keys(event.mentions || {}).length)
      uid = Object.keys(event.mentions)[0];
  else if (args[0] && /^\d{5,}$/.test(args[0]))
      uid = args[0];
  else if (event.type === "message_reply" && event.messageReply?.senderID)
      uid = event.messageReply.senderID;
  else
      uid = event.senderID;

  const waitMsg = toSmallCaps("⏳ Récupération des données du profil...");
  const wait = await new Promise((resolve) => {
    api.sendMessage(waitMsg, event.threadID, (err, info) => resolve(info), event.messageID);
  });

  let coverUrl = null;
  let userName = "";

  if (!coverUrl) {
      try {
          const result = await fetchViaFCA(api, uid);
          coverUrl = result?.url || null;
          if (result?.name) userName = result.name;
      } catch {}
  }
  if (!coverUrl) {
      try { coverUrl = await fetchViaGraphQL(api, uid); } catch {}
  }
  if (!coverUrl) {
      try {
          const cookieStr = getCookieString(api);
          if (cookieStr) coverUrl = await fetchViaMbasic(uid, cookieStr);
      } catch {}
  }
  if (!coverUrl) {
      try { coverUrl = await fetchCoverAlbum(api, uid); } catch {}
  }

  const profilePicUrl = `https://graph.facebook.com/${uid}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  if (wait?.messageID) safeUnsend(api, wait.messageID);

  if (!coverUrl) {
      try {
          const cookieStr = getCookieString(api);
          const ppBuffer  = await downloadImage(profilePicUrl, cookieStr);
          const ppFile    = path.join(CACHE_DIR, `pp_${uid}_${Date.now()}.jpg`);
          await fs.writeFile(ppFile, ppBuffer);

          const bodyText = [
              "╭┈─────── ೄྀ࿐",
              `  ${toSmallCaps("Photo de profil")}`,
              ` ᴜɪᴅ  : ${uid}`,
              "╰┈──────┈──────┈",
          ].join("\n");

          await api.sendMessage({
              body: bodyText,
              attachment: fs.createReadStream(ppFile),
          }, event.threadID, event.messageID);

          setTimeout(() => fs.remove(ppFile).catch(() => {}), 60_000);
      } catch {
          const notFoundMsg = 
              `     ⚠️ ${toSmallCaps("Non trouvé")}\n` +
              "╰┈──────┈──────┈\n" +
              `${toSmallCaps("Impossible de trouver la photo de couverture de cet utilisateur.")}\n\n` +
              `${toSmallCaps("Assurez-vous que :")}\n` +
              `• ${toSmallCaps("Le compte possède une photo de couverture")}\n` +
              `• ${toSmallCaps("Le profil est accessible publiquement")}`;

          await api.sendMessage(notFoundMsg, event.threadID, event.messageID);
      }
      return;
  }

  try {
      const cookieStr = getCookieString(api);

      const [coverBuffer, ppBuffer] = await Promise.all([
          downloadImage(coverUrl,      cookieStr),
          downloadImage(profilePicUrl, cookieStr),
      ]);

      if (!coverBuffer || coverBuffer.length < 500)
          throw new Error("Couverture trop petite ou invalide");

      const coverFile = path.join(CACHE_DIR, `cover_${uid}_${Date.now()}.jpg`);
      const ppFile    = path.join(CACHE_DIR, `pp_${uid}_${Date.now()}.jpg`);

      await Promise.all([
          fs.writeFile(coverFile, coverBuffer),
          fs.writeFile(ppFile,    ppBuffer),
      ]);

      const lines = [
          "╭┈─────── ೄྀ࿐"
      ];
      if (userName) lines.push(` ɴᴏᴍ   : ${toSmallCaps(userName)}`);
      lines.push(
          ` ᴜɪᴅ   : ${uid}`,
          ` ᴄᴏᴜᴠᴇʀᴛᴜʀᴇ : ${Math.round(coverBuffer.length / 1024)} ᴋʙ`,
          ` ᴀᴠᴀᴛᴀʀ     : ${Math.round(ppBuffer.length / 1024)} ᴋʙ`,
          "╰┈──────┈──────┈"
      );

      await api.sendMessage({
          body: lines.join("\n"),
          attachment: [
              fs.createReadStream(coverFile),
              fs.createReadStream(ppFile),
          ],
      }, event.threadID, event.messageID);

      setTimeout(() => {
          fs.remove(coverFile).catch(() => {});
          fs.remove(ppFile).catch(() => {});
      }, 60_000);

  } catch (e) {
      const failMsg = 
          `❌ ${toSmallCaps("Échec du téléchargement")}\n` +
          "━━━━━━━━━━━━━━━━\n" +
          toSmallCaps(e.message || "Impossible de télécharger les images.");

      return api.sendMessage(failMsg, event.threadID, event.messageID);
  }
};

function safeUnsend(api, mid) {
    try { api.unsendMessage(mid); } catch {}
}

function getCookieString(api) {
    try {
        if (api?.ctx?.jar) {
            const s = api.ctx.jar.getCookieStringSync("https://www.facebook.com");
            if (s?.length > 10) return s;
        }
    } catch {}
    try {
        const candidates = [
            path.join(process.cwd(), "accounts", "account.txt"),
            path.join(process.cwd(), "accounts", "account2.txt"),
        ];
        for (const p of candidates) {
            if (!fs.existsSync(p)) continue;
            const data = JSON.parse(fs.readFileSync(p, "utf8"));
            if (!Array.isArray(data) || !data.length) continue;
            const str = data.map(c => `${c.key || c.name}=${c.value}`).join("; ");
            if (str) return str;
        }
    } catch {}
    return null;
}

async function fetchViaFCA(api, uid) {
    if (!api?.defaultFuncs?.get || !api?.ctx?.jar) return null;
    const urls = [
        `https://www.facebook.com/profile.php?id=${uid}`,
        `https://www.facebook.com/profile.php?id=${uid}&sk=about`,
    ];
    for (const url of urls) {
        try {
            const res = await api.defaultFuncs.get(url, api.ctx.jar, null, null, {
                "accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "accept-language":           "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
                "upgrade-insecure-requests": "1",
                "sec-fetch-dest":            "document",
                "sec-fetch-mode":            "navigate",
                "sec-fetch-site":            "none",
            });
            const html = typeof res === "string" ? res : res?.body || "";
            if (!html || html.length < 1000) continue;
            const found = extractCoverFromHtml(html);
            if (found?.url) return found;
        } catch {}
    }
    return null;
}

async function fetchViaGraphQL(api, uid) {
    if (!api?.defaultFuncs?.post || !api?.ctx?.jar || !api?.ctx?.fb_dtsg) return null;
    const ctx = api.ctx;
    const queries = [
        { docId: "6210562829060700", friendlyName: "ProfileCometRouteQuery",      variables: { userID: String(uid), scale: 1 } },
        { docId: "5310186665765099", friendlyName: "CometUserProfileHeaderQuery", variables: { userID: String(uid), scale: 1, shouldDeferMainStories: false } },
    ];
    for (const q of queries) {
        try {
            const form = {
                av:                       String(ctx.userID || ""),
                __user:                   String(ctx.userID || ""),
                __a:                      "1",
                fb_dtsg:                  ctx.fb_dtsg,
                jazoest:                  ctx.jazoest || "",
                lsd:                      ctx.lsd     || "",
                fb_api_caller_class:      "RelayModern",
                fb_api_req_friendly_name: q.friendlyName,
                variables:                JSON.stringify(q.variables),
                doc_id:                   q.docId,
                server_timestamps:        "true",
            };
            const raw  = await api.defaultFuncs.post("https://www.facebook.com/api/graphql/", ctx.jar, form);
            const text = typeof raw === "string" ? raw : JSON.stringify(raw);
            const url  = extractCoverFromJsonText(text);
            if (url) return url;
        } catch {}
    }
    return null;
}

async function fetchViaMbasic(uid, cookieStr) {
    const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    const headers = {
        cookie:                      cookieStr,
        "user-agent":                UA,
        "accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "accept-language":           "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "upgrade-insecure-requests": "1",
        "sec-fetch-dest":            "document",
        "sec-fetch-mode":            "navigate",
        "sec-fetch-site":            "none",
    };
    for (const url of [
        `https://www.facebook.com/profile.php?id=${uid}`,
        `https://www.facebook.com/profile.php?id=${uid}&sk=about`,
    ]) {
        try {
            const res = await axios.get(url, { headers, timeout: 20000, maxRedirects: 5 });
            if (res.status === 200 && res.data?.length > 5000) {
                const found = extractCoverFromHtml(res.data);
                if (found?.url) return found.url;
            }
        } catch {}
    }
    try {
        const mHeaders = { ...headers, "user-agent": "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36" };
        const res = await axios.get(`https://mbasic.facebook.com/profile.php?id=${uid}`, {
            headers: mHeaders, timeout: 15000, maxRedirects: 10,
        });
        return extractCoverFromHtml(res.data || "")?.url || null;
    } catch { return null; }
}

async function fetchCoverAlbum(api, uid) {
    if (!api?.defaultFuncs?.get || !api?.ctx?.jar) return null;
    try {
        const res = await api.defaultFuncs.get(
            `https://mbasic.facebook.com/media/albums/?id=${uid}`,
            api.ctx.jar, null, null, {
                "accept":          "text/html,application/xhtml+xml",
                "accept-language": "fr-FR,fr;q=0.9",
                "user-agent":      "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36",
            }
        );
        const html = typeof res === "string" ? res : res?.body || "";
        if (!html) return null;
        const albumMatch = html.match(/href="([^"]*cover[^"]*album[^"]*|[^"]*album[^"]*cover[^"]*)"/i);
        if (!albumMatch) return null;
        const albumUrl = "https://mbasic.facebook.com" + albumMatch[1].replace(/&amp;/g, "&");
        const res2     = await api.defaultFuncs.get(albumUrl, api.ctx.jar);
        const html2    = typeof res2 === "string" ? res2 : res2?.body || "";
        return extractCoverFromHtml(html2)?.url || null;
    } catch { return null; }
}

function extractCoverFromHtml(html) {
    if (!html) return null;
    let name = null;
    const nameMatch = html.match(/"name"\s*:\s*"([^"]{2,60})"/);
    if (nameMatch) name = nameMatch[1];

    const r1 = extractCoverFromJsonText(html);
    if (r1) return { url: r1, name };

    try {
        const $ = cheerio.load(html);
        const coverImg = $('img[data-imgperflogname="profileCoverPhoto"]').first();
        if (coverImg.length) {
            const src = coverImg.attr("src");
            if (src && src.startsWith("http")) return { url: src.replace(/&amp;/g, "&"), name };
        }
        const containerImg = $("#profile_cover_photo_container img").first();
        if (containerImg.length) {
            const src = containerImg.attr("src");
            if (src && src.startsWith("http")) return { url: src.replace(/&amp;/g, "&"), name };
        }
    } catch {}

    const tagMatch = /<img[^>]*data-imgperflogname="profileCoverPhoto"[^>]*>/i.exec(html);
    if (tagMatch) {
        const srcInTag = /src="([^"]+)"/.exec(tagMatch[0]);
        if (srcInTag) return { url: srcInTag[1].replace(/&amp;/g, "&"), name };
    }

    const boxMatch = html.match(/id="profile_cover_photo_container"[^>]*>[\s\S]{0,500}?<img[^>]+src="([^"]+)"/);
    if (boxMatch) return { url: boxMatch[1].replace(/&amp;/g, "&"), name };

    const linkRe = /https:\/\/(?:scontent|lookaside)\.[^"'<>\s]+/g;
    const found  = [];
    let m;
    while ((m = linkRe.exec(html)) !== null) {
        const u = m[0].replace(/&amp;/g, "&");
        if (!u.includes("s160x160") && !u.includes("s40x40") && !u.includes("cp0_dst-jpg"))
            found.push(u);
    }
    const bySid = found.find(u => u.includes("_nc_sid=cc71e4"));
    if (bySid) return { url: bySid, name };
    const big   = found.find(u => u.includes("_s720x720") || u.includes("1500x") || u.includes("t39.30808"));
    if (big) return { url: big, name };
    if (found[0]) return { url: found[0], name };

    return null;
}

function extractCoverFromJsonText(text) {
    if (!text) return null;
    const patterns = [
        /"coverPhoto"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/,
        /"cover_photo"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/,
        /"cover"\s*:\s*\{[^}]*"source"\s*:\s*"([^"]+)"/,
        /"cover"\s*:\s*\{"uri"\s*:\s*"([^"]+)"/,
        /"cover_image"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/,
        /"CoverPhoto"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/,
        /"full_screen_image"\s*:\s*\{[^}]*"uri"\s*:\s*"([^"]+)"/,
        /"coverPhoto"\s*:\s*"(https:[^"]+)"/,
    ];
    for (const re of patterns) {
        const m = re.exec(text);
        if (m) {
            return m[1]
                .replace(/\\u0026/g, "&")
                .replace(/\\u002F/g, "/")
                .replace(/\\\//g, "/")
                .replace(/\\/g, "")
                .trim();
        }
    }
    return null;
}

async function downloadImage(url, cookieStr) {
    const headers = {
        "accept":     "image/webp,image/apng,image/*,*/*;q=0.8",
        "referer":    "https://www.facebook.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        ...(cookieStr ? { cookie: cookieStr } : {}),
    };
    const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout:      20000,
        maxRedirects: 5,
        headers,
    });
    return Buffer.from(res.data);
}

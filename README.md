
# Site de Création de ChatBots

Bienvenue sur le site de création de ChatBots ! Cette plateforme a été conçue pour vous permettre de créer facilement et rapidement vos propres ChatBots, personnalisés selon vos besoins.
visiter : https://meganae.github.io/Res-auto/

## Fonctionnalités

- Création simple et rapide de ChatBots.
- Intégration avec divers outils de déploiement comme **Vercel**, **Heroku**, **Netlify**, **Koyeb**, **Render**, et bien d'autres.
- Interface intuitive et adaptée aux débutants comme aux experts.

## Aperçu

<img src="assets/apercue.jpg" width="100%">

---

## Déploiement

Notre plateforme supporte une large gamme de services de déploiement. Voici quelques exemples :

### Déploiement sur Netlify

![Logo de Netlify](https://www.logo.wine/a/logo/Netlify/Netlify-Logo.wine.svg)

###  Installation des  Dependencies

Install the required dependencies:

```bash
npm install
```

### 5. déploiement 

Start your bot using the following command:

```bash
npm start
```
**ou**

```node
node index.js
```
## 📦 Deployment sur Vercel

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Creee un fichier `vercel.json` :**

   Add a `vercel.json` file to the root directory with the following content:

   ```json
   {
     "version": 2,
     "builds": [
       { "src": "index.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "/index.js" }
     ]
   }
   ```

3. **Deployer votre Bot:**

   Run the following command to deploy:

   ```bash
   vercel
   ```

   Follow the prompts to complete the deployment.
---
**Example Usage:**

```javascript

module.exports.config={
  name:""
}
module.exports.onChat= async({api,event}) =>{
  try {
    
  } catch (error) {
    
  }
}
//all system are same just onChat to chat,handleEvent, noPrefix.
```
**Example Usage:**

```javascript
const axios = require('axios');
module.exports.config = {
  name: 'ai',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gpt', 'openai', 'assistant'],
  description: "An AI command powered by GPT-4",
  usage: "Ai [promot]",
  credits: 'Metoushela Walker',
  cooldown: 3,
};
module.exports.run = async function({
  api,
  event,
  args
}) {
  const input = args.join(' ');
  if (!input) {
    api.sendMessage(`⚘𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁⊰♔⊱\n\n⊰⊹⊱♡⊰⊹⊱♡⊰⊹⊱♡⊰⊹n\nHey salut! Belle journée, pas vrai ? Pose ta question 💭, je serai ravie de t'aider.💜✏\n╰┈➤⊹⊱✫⊰⊹⊱✫⊰🍀`, event.threadID, event.messageID);
    return;
  }
  api.sendMessage(`☘️𝚂ｈ𝚎𝚊ｒ𝚌ｈ...\n━━━━━━━━━━━\n "${input}"`, event.threadID, event.messageID);
  try {
    const {
      data
    } = await axios.get(`https://metoushela-rest-api-tp5g.onrender.com/api/gpt4o?context=${encodeURIComponent(input)}`);
    const response = data.response;
    api.sendMessage('⚘𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁⊰♔⊱\n\n⊰⊹⊱♡⊰⊹⊱♡⊰⊹⊱♡⊰⊹\n' + response + '\n╰┈➤⊹⊱✫⊰⊹⊱✫⊰🍀', event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage('🔴 An error occurred while processing your request..', event.threadID, event.messageID);
  }
};
```

---


## À propos du créateur

<img src="assets/admin.jpg" width="100%">
Ce projet a été créé par **Metoushela Walker**, un développeur passionné par l'intelligence artificielle et la technologie.

### Quelques informations sur Metoushela Walker :

- **Profession** : Développeur Full Stack et passionné d'IA.
- **Intérêt** : Créer des outils qui simplifient la vie des utilisateurs.
- **Contact** : [Facebook de Metoushela Walker](https://www.facebook.com/MetoushelaWalker)

---

## Contribuer

Les contributions sont les bienvenues ! Si vous avez des idées ou des suggestions, n'hésitez pas à ouvrir une issue ou à soumettre une pull request.

---

## Licence

Ce projet est sous licence [MIT](LICENSE).

---

 

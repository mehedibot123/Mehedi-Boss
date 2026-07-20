const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const axios = require('axios');

const deltaNext = global.GoatBot?.configCommands?.envCommands?.rank?.deltaNext || 1;
const expToLevel = exp => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);

module.exports = {
  config: {
    name: "rankup",
    version: "2.0.0",
    author: "BADHON BABY",
    countDown: 2,
    role: 1,
    category: "edit-img",
    shortDescription: "Announce rankup for each group/user",
    longDescription: "Announce rankup with image for each group/user",
    guide: "{pn} [on/off]"
  },
  
  langs: {
    en: {
      on: "✅ ON",
      off: "❌ OFF",
      turnedOn: "Rankup notifications have been turned ON!",
      turnedOff: "Rankup notifications have been turned OFF!",
      syntaxError: "Please use: {pn} on or {pn} off",
      levelup: "{name}, your level has increased to {level} 🎉"
    }
  },
  
  onStart: async function({ message, event, threadsData, args, getLang }) {
    if (!["on", "off"].includes(args[0]))
      return message.reply(getLang("syntaxError"));
      
    await threadsData.set(event.threadID, args[0] == "on", "settings.sendRankupMessage");
    return message.reply(args[0] == "on" ? getLang("turnedOn") : getLang("turnedOff"));
  },

  onChat: async function({ api, event, usersData, threadsData, message, getLang }) {
    const { threadID, senderID } = event;
    
    const threadData = await threadsData.get(threadID);
    const sendRankupMessage = threadData.settings?.sendRankupMessage;
    if (!sendRankupMessage) return;
    
    const userData = await usersData.get(senderID);
    const exp = userData.exp + 1;
    
    const currentLevel = expToLevel(exp);
    const previousLevel = expToLevel(exp - 1);
    
    if (currentLevel > previousLevel && currentLevel != 1) {
      const name = userData.name;
      
      let customMessage = threadData.data?.rankup?.message || getLang("levelup");
      customMessage = customMessage.replace(/\{name}/g, name).replace(/\{level}/g, currentLevel);
      
      const backgroundUrls = [
        "https://i.ibb.co/DffbB7x/2-7-BDCACE.png",
        "https://i.ibb.co/606p1ZF/1-C0-CF112.png",
        "https://i.ibb.co/54b5KY6/3-10100-BC.png",
        "https://i.ibb.co/4RHd3mM/4-AB4-CF2-B.png",
        "https://i.ibb.co/7WHKF0H/9-498-C5-E0.png",
        "https://i.ibb.co/nPfY3HN/8-ADA7767.png",
        "https://i.ibb.co/Ldctgw4/5-49-F92-DC.png",
        "https://i.ibb.co/J29hdFW/6-EB49-EF4.png"
      ];
      
      const randomBg = backgroundUrls[Math.floor(Math.random() * backgroundUrls.length)];
      const pathImg = `${__dirname}/tmp/rankup_${senderID}_${Date.now()}.png`;
      const pathAvt = `${__dirname}/tmp/avt_${senderID}_${Date.now()}.png`;
      
      await fs.ensureDir(`${__dirname}/tmp`);
      
      try {
        const avatarData = await axios.get(
          `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        );
        fs.writeFileSync(pathAvt, Buffer.from(avatarData.data));
        
        const bgData = await axios.get(randomBg, { responseType: "arraybuffer" });
        fs.writeFileSync(pathImg, Buffer.from(bgData.data));
        
        const baseImage = await loadImage(pathImg);
        const baseAvt = await loadImage(pathAvt);
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");
        
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        ctx.rotate(-25 * Math.PI / 180);
        ctx.drawImage(baseAvt, 90, 330, 340, 340);
        
        ctx.rotate(25 * Math.PI / 180);
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 10;
        ctx.fillText(`${name}`, 250, 750);
        ctx.font = 'bold 35px Arial';
        ctx.fillText(`Level ${currentLevel}`, 300, 820);
        
        const imageBuffer = canvas.toBuffer();
        fs.writeFileSync(pathImg, imageBuffer);
        fs.unlinkSync(pathAvt);
        
        await message.reply({
          body: customMessage,
          attachment: fs.createReadStream(pathImg)
        });
        
        fs.unlinkSync(pathImg);
      } catch (error) {
        console.error("Rankup image error:", error);
        await message.reply(customMessage);
        if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
        if (fs.existsSync(pathAvt)) fs.unlinkSync(pathAvt);
      }
    }
    
    await usersData.set(senderID, { exp });
  }
};

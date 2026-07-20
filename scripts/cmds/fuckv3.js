// fuckv3.js
const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "fuckv3",
    aliases: ["chod", "chuda"],
    version: "1.3.0",
    author: "Rahad",
    countDown: 5,
    role: 0,
    shortDescription: "Fuck edit with template v3",
    longDescription: "Put user profile pictures exactly on placeholders in background",
    category: "funny",
    guide: "{pn} @tag"
  },

  onStart: async function ({ event, api }) {
    try {
      const id1 = event.senderID;
      const mentions = Object.keys(event.mentions || {});
      const id2 = mentions[0];
      if (!id2) return api.sendMessage("❌ | Please mention someone!", event.threadID, event.messageID);

      // Load avatars
      const avatar1 = await Canvas.loadImage(
        `https://graph.facebook.com/${id1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const avatar2 = await Canvas.loadImage(
        `https://graph.facebook.com/${id2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      // New background
      const backgroundURL = "https://drive.google.com/uc?export=view&id=1-KNuzimlf55hZn-eu47cB-3OrnVY48xr";
      const background = await Canvas.loadImage(backgroundURL);

      // Create canvas
      const canvas = Canvas.createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Avatar positions and sizes same as fuckv4
      const left = { x: 240, y: 30, size: 100 };  // Sender
      const right = { x: 100, y: 200, size: 100 }; // Mentioned user

      // Circle crop function
      function drawCircle(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      // Draw avatars
      drawCircle(avatar1, left.x, left.y, left.size);
      drawCircle(avatar2, right.x, right.y, right.size);

      // Save result
      const outputPath = path.join(__dirname, "/cache/fuckv3.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        api.sendMessage(
          { 
            body: "╔═━「 💋 𝑭𝒖𝒄𝒌 𝑬𝒅𝒊𝒕 𝑽3 💋 」━═╗\n║   🔥 𝐓𝐰𝐨 𝐒𝐨𝐮𝐥𝐬… 𝐎𝐧𝐞 𝐁𝐨𝐧𝐝 🔥   ║\n╚═━────────────────────━═╝",
            attachment: fs.createReadStream(outputPath) 
          },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ | Something went wrong!", event.threadID, event.messageID);
    }
  },
};

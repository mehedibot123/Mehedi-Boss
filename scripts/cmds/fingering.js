const fs = require("fs-extra");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "fingering",
    aliases: ["finger", "fng"],
    version: "1.0.0",
    author: "RAHAD",
    countDown: 5,
    role: 0,
    shortDescription: "Crush edit with template",
    longDescription: "Put user profile pictures exactly on placeholders in background",
    category: "funny",
    guide: "{pn} @tag"
  },

  onLoad: async () => {
    const { resolve } = require("path");
    const { existsSync, mkdirSync } = require("fs-extra");
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + `/cache/`;
    const path = resolve(dirMaterial, 'crush.png');
    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile(
      "https://drive.google.com/uc?id=1-M9nvV5CpInNyoSxEaTfQ90Da8KK9TXd",
      path
    );
  },

  onStart: async function ({ event, api }) {
    try {
      const { senderID, mentions, threadID, messageID } = event;
      const mention = Object.keys(mentions || {});
      if (!mention[0]) return api.sendMessage("❌ | Please mention someone!", threadID, messageID);

      const id1 = senderID;
      const id2 = mention[0];

      // Load background
      const background = await Canvas.loadImage(__dirname + `/cache/crush.png`);

      // Load avatars
      const avatar1 = await Canvas.loadImage(
        `https://graph.facebook.com/${id1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const avatar2 = await Canvas.loadImage(
        `https://graph.facebook.com/${id2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      // Create canvas
      const canvas = Canvas.createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Draw avatars with fixed size/position (like fingering.js)
      const left = { x: 340, y: 120, size: 200 };
      const right = { x: 100, y: 220, size: 200 };

      function drawCircle(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawCircle(avatar1, left.x, left.y, left.size);
      drawCircle(avatar2, right.x, right.y, right.size);

      // Save & send
      const pathOut = __dirname + "/cache/crush_out.png";
      const out = fs.createWriteStream(pathOut);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on("finish", () => {
        const bodyMessage = `
╔═══════════════════╗
    💖✨ 𝗔𝗵𝗵𝗵 𝗕𝗕𝗬 💥
╚═══════════════════╝
        `;
        api.sendMessage(
          {
            body: bodyMessage,
            attachment: fs.createReadStream(pathOut)
          },
          threadID,
          () => fs.unlinkSync(pathOut),
          messageID
        );
      });
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ | Something went wrong!", event.threadID, event.messageID);
    }
  }
};

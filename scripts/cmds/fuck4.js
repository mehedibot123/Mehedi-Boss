// fuckv4.js
const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "fuckv4",
    aliases: ["chod", "chuda"],
    version: "1.4.4",
    author: "Rahad",
    countDown: 5,
    role: 0,
    shortDescription: "Fuck edit with template v4",
    longDescription: "Put user profile pictures exactly on template v4 with deep text style"
  },

  onLoad: async () => {
    const dir = path.join(__dirname, "cache", "canvas");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const bgPath = path.join(dir, "fucksv5.png");
    if (!fs.existsSync(bgPath)) {
      // Google Drive direct download link (replace 'FILE_ID' with your file's ID)
      const driveFileId = "1-QzWREWx9fCVC-kt4JPr9ICza1eMycPh";
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${driveFileId}`;

      const response = await axios.get(downloadUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(bgPath, response.data);
      console.log("✅ Background image downloaded from Drive.");
    }
  },

  onStart: async function ({ args, message, event, api }) {
    const userID = event.senderID;
    const mention = args.join(" ") || "";

    try {
      const canvas = Canvas.createCanvas(700, 700);
      const ctx = canvas.getContext("2d");

      // ===== LOAD BACKGROUND IMAGE =====
      const bgPath = path.join(__dirname, "cache", "canvas", "fucksv5.png");
      const bgImage = await Canvas.loadImage(bgPath);
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

      // ===== LOAD USER AVATAR =====
      const userAvatarBuffer = await global.getUserAvatar(userID);
      const userAvatar = await Canvas.loadImage(userAvatarBuffer);

      // ===== DRAW USER AVATAR =====
      ctx.drawImage(userAvatar, 250, 200, 200, 200);

      // ===== BODY TEXT / DESIGN (Deep style) =====
      ctx.font = "bold 50px Arial";
      ctx.fillStyle = "#ff4444";
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 15;
      ctx.fillText(`Hey ${mention}`, 180, 500);

      // ===== OPTIONAL CIRCLE FRAME AROUND AVATAR =====
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(350, 300, 110, 0, Math.PI * 2);
      ctx.stroke();

      // ===== SAVE FINAL IMAGE =====
      const outPath = path.join(__dirname, "cache", `fuckv4_${userID}.png`);
      fs.writeFileSync(outPath, canvas.toBuffer());

      return api.sendMessage(
        { attachment: fs.createReadStream(outPath) },
        message.threadID,
        () => fs.unlinkSync(outPath)
      );

    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "❌ Failed to edit image. Please try again later.",
        message.threadID
      );
    }
  },
};

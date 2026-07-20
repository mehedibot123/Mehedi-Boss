const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "alive",
    version: "1.6",
    author: "Mashrafi Mod",
    shortDescription: "Alive check with video",
    longDescription: "Replies with bot status + a video",
    category: "alive",
    guide: {
      en: "Just type: alive (no prefix needed)"
    },
    usePrefix: false,      // 🔥 No prefix needed
    noPrefix: true,        // 🔥 Support plain "alive" message
    onChat: true
  },

  onStart: async ({ message }) => sendAlive(message),

  onChat: async ({ event, message }) => {
    const text = event.body?.toLowerCase().trim();
    if (text === "alive") {
      await sendAlive(message);
    }
  }
};

async function sendAlive(message) {
  const videoUrl = "https://drive.google.com/uc?export=download&id=11HzOxul7_9e0ltUnPQK7I9LGCLD7UXNx";
  const videoPath = `${__dirname}/cache/alive.mp4`;

  // Ensure cache folder exists
  if (!fs.existsSync(`${__dirname}/cache`)) {
    fs.mkdirSync(`${__dirname}/cache`);
  }

  try {
    const res = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(videoPath);
    res.data.pipe(writer);

    writer.on("finish", async () => {
      await message.reply({
        body: `
───────────────
✨ RACIST BOT ✨

Bot is alive and king!
Made by: Mashrafi
Ready to serve you.

───────────────`,
        attachment: fs.createReadStream(videoPath)
      });

      fs.unlinkSync(videoPath); // delete after sending
    });

    writer.on("error", (err) => {
      console.error("Error writing file:", err);
    });

  } catch (err) {
    console.error("Error downloading video:", err);
    message.reply("❌ Failed to check alive status.");
  }
      }

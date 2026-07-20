// slap fixed version
const Canvas = require("canvas");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "slap",
    version: "1.0",
    author: "Badhon (Fixed)",
    role: 0,
    category: "funny",
    guide: "{pn} @mention"
  },

  onStart: async ({ event, api, usersData }) => {
    const mention = Object.keys(event.mentions || {});
    if (!mention[0])
      return api.sendMessage("❌ Mention someone!", event.threadID);

    try {
      const uid1 = event.senderID;
      const uid2 = mention[0];

      const getAvatar = async (uid) => {
        const url = await usersData.getAvatarUrl(uid);
        const res = await axios.get(url, { responseType: "arraybuffer" });
        return Canvas.loadImage(res.data);
      };

      const bg = await Canvas.loadImage(
        "https://i.imgur.com/fYxZQkK.png"
      );

      const av1 = await getAvatar(uid1);
      const av2 = await getAvatar(uid2);

      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0);
      ctx.drawImage(av1, 50, 200, 180, 180);
      ctx.drawImage(av2, 350, 30, 180, 180);

      const out = path.join(__dirname, "tmp", "slap.png");
      fs.writeFileSync(out, canvas.toBuffer());

      api.sendMessage(
        { body: "👋 Boppp!", attachment: fs.createReadStream(out) },
        event.threadID,
        () => fs.unlinkSync(out)
      );
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Failed to generate slap", event.threadID);
    }
  }
};

const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const request = require("request");
const fs = require("fs");

module.exports = {
  config: {
    name: "kill",
    version: "1.0.0",
    hasPermission: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Slap the friend tag",
    commandCategory: "general",
    usages: "kill [Tag someone you want to slap]",
    cooldowns: 5
  },

  onStart: async function ({ message, event, args, api }) {
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
      return message.reply("Please tag someone!");
    }

    try {
      const res = await axios.get("https://api.waifu.pics/sfw/slap");
      const getURL = res.data.url;
      const ext = getURL.substring(getURL.lastIndexOf(".") + 1);
      const mentionID = Object.keys(event.mentions)[0];
      const tag = event.mentions[mentionID].replace("@", "");

      const filePath = `${__dirname}/cache/slap.${ext}`;
      const fileStream = fs.createWriteStream(filePath);

      request(getURL).pipe(fileStream).on("close", () => {
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        message.reply({
          body: `Slapped! ${tag}\n\n*sorry, I thought there's a mosquito*`,
          mentions: [{ tag: tag, id: mentionID }],
          attachment: fs.createReadStream(filePath)
        }).then(() => fs.unlinkSync(filePath));
      });
    } catch (err) {
      message.reply("❌ Failed to generate GIF, make sure you have tagged someone!");
      api.setMessageReaction("☹️", event.messageID, () => {}, true);
    }
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });

const axios = require("axios");

module.exports = {
  config: {
    name: "fork",
    aliases: ["Ayanesan", "ayane"],
    version: "3.0",
    author: "Badhon",
    role: 0,
    shortDescription: "Premium repo info",
    longDescription: "Shows GitHub repo with premium UI and stats",
    category: "utility",
    guide: "{prefix}fork"
  },

  onStart: async function ({ message }) {
    try {
      const repo = "Badhon-00/MELISSA-CHAT-BOT-V4";
      const forkLink = "https://github.com/Badhon-00/MELISSA-CHAT-BOT-V4.git";

      const res = await axios.get(`https://api.github.com/repos/${repo}`);

      const {
        stargazers_count,
        forks_count,
        watchers_count,
        open_issues_count,
        size,
        language,
        updated_at
      } = res.data;

      const updated = new Date(updated_at).toLocaleDateString();

      const ui = `
╭━━━〔 𝗔𝗬𝗔𝗡𝗘 𝗦𝗔𝗡 𝗩𝟰 〕━━━⬣
┃ ✦ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗥𝗘𝗣𝗢
┃
┃ 🔗 𝗥𝗘𝗣𝗢:
┃ ${forkLink}
┃
┣━━━━━━━━━━━━━━━━
┃ ⭐ 𝗦𝘁𝗮𝗿𝘀      : ${stargazers_count}
┃ 🍴 𝗙𝗼𝗿𝗸𝘀      : ${forks_count}
┃ 👀 𝗪𝗮𝘁𝗰𝗵𝗲𝗿𝘀   : ${watchers_count}
┃ 🐞 𝗜𝘀𝘀𝘂𝗲𝘀     : ${open_issues_count}
┃ 💻 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲   : ${language || "N/A"}
┃ 📦 𝗦𝗶𝘇𝗲       : ${size} KB
┃ 🕒 𝗨𝗽𝗱𝗮𝘁𝗲𝗱    : ${updated}
┣━━━━━━━━━━━━━━━━
┃ 💖 𝗗𝗘𝗔𝗥 𝗕𝗕𝗬 😗
┃ 𝗘𝗡𝗝𝗢𝗬 𝗬𝗢𝗨𝗥 𝗙𝗢𝗥𝗞
┃
┃ 👑 𝗖𝗥𝗘𝗔𝗧𝗘𝗗 𝗕𝗬 BADHON
╰━━━━━━━━━━━━━━━━⬣
      `;

      await message.reply(ui);

    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to fetch repo info.");
    }
  }
};

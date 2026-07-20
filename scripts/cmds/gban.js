const fs = require("fs");
const dbFile = __dirname + "/gbanData.json";

function loadDB() {
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "[]");
  return JSON.parse(fs.readFileSync(dbFile));
}

function saveDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "gban",
    version: "1.0.0",
    author: "BaYjid",
    countDown: 3,
    role: 1,
    description: "GBAN / UNGBAN / BANLIST all-in-one 🔥",
  },

  onStart: async function ({ api, event, args }) {
    const command = args[0]?.toLowerCase();
    const banDB = loadDB();
    const mentionID = Object.keys(event.mentions || {})[0];
    const uid = mentionID || args[1];

    if (command === "gban") {
      if (!uid) return api.sendMessage("🔎 Mention or type a UID to ban.", event.threadID);

      if (banDB.includes(uid))
        return api.sendMessage(`⛔ ${uid} is already locked out.`, event.threadID);

      banDB.push(uid);
      saveDB(banDB);

      const reason = args.slice(mentionID ? 1 : 2).join(" ") || "No reason given 🐸";

      return api.sendMessage(
        `🚫 GBAN SUCCESS\n👤 UID: ${uid}\n📄 Reason: ${reason}`,
        event.threadID
      );
    }

    if (command === "unban") {
      if (!uid) return api.sendMessage("⚠️ UID koi boss?", event.threadID);

      if (!banDB.includes(uid))
        return api.sendMessage(`🤷‍♂️ ${uid} is not even banned bruh.`, event.threadID);

      const updated = banDB.filter((id) => id !== uid);
      saveDB(updated);

      return api.sendMessage(`✅ ${uid} has been unbanned. Set free 🕊️`, event.threadID);
    }

    if (command === "list") {
      if (!banDB.length) return api.sendMessage("🎉 Nobody banned. Server clean AF!", event.threadID);

      const list = banDB.map((id, i) => `${i + 1}. ${id}`).join("\n");
      return api.sendMessage(`📜 GBAN LIST:\n\n${list}`, event.threadID);
    }

    
    return api.sendMessage(
      `🧩 GBAN SYSTEM\n\n` +
      `🛑 gban gban <uid> [reason] - Ban by UID\n` +
      `🛑 gban @user [reason] - Ban by mention\n` +
      `✅ gban ungban <uid> - Unban someone\n` +
      `📋 gban banlist - Show ban list\n\n` +
      `💡 Example: gban gban 1000111 spamming nonsense`,
      event.threadID
    );
  },
};
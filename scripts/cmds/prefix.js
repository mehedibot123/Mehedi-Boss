const fs = require("fs-extra");
const { utils } = global;

const ADMIN_UID = "61563924155936";

module.exports = {
	config: {
		name: "prefix",
		version: "4.1",
		author: "Badhon",
		countDown: 5,
		role: 0,
		category: "System",
		guide: "› {pn} <prefix>\n› {pn} <prefix> -g\n› {pn} reset\n› {pn} reset -g"
	},

	langs: {
		en: {
			reset: "『 𝐏𝐑𝐄𝐅𝐈𝐗 𝐑𝐄𝐒𝐄𝐓 』\n\n✦ Prefix reset to default: %1\n\n➤ Action by: 𝗕𝗮𝗱𝗵𝗼𝗻",
			onlyAdmin: "『 𝐀𝐂𝐂𝐄𝐒𝐒 𝐃𝐄𝐍𝐈𝐄𝐃 』\n\n✦ Only 𝗕𝗮𝗱𝗵𝗼𝗻 can change my prefix.",
			confirmGlobal: "『 𝐂𝐎𝐍𝐅𝐈𝐑𝐌 𝐆𝐋𝐎𝐁𝐀𝐋 』\n\n✦ React to confirm system-wide prefix change",
			confirmThisThread: "『 𝐂𝐎𝐍𝐅𝐈𝐑𝐌 𝐂𝐇𝐀𝐓 』\n\n✦ React to confirm chat prefix change",
			successGlobal: "『 𝐆𝐋𝐎𝐁𝐀𝐋 𝐔𝐏𝐃𝐀𝐓𝐄 』\n\n✦ System prefix changed to: %1\n\n➤ Action by: 𝗕𝗮𝗱𝗵𝗼𝗻",
			successThisThread: "『 𝐂𝐇𝐀𝐓 𝐔𝐏𝐃𝐀𝐓𝐄 』\n\n✦ Chat prefix changed to: %1\n\n➤ Action by: 𝗕𝗮𝗱𝗵𝗼𝗻",
			myPrefix: "『 𝐌𝐄𝐋𝐈𝐒𝐒𝐀 𝐏𝐑𝐄𝐅𝐈𝐗 』\n\n✦ System Prefix: %1\n✦ Chat Prefix: %2\n\n『 𝐓𝐈𝐌𝐄 』\n› Date: %3\n› Day: %4\n› Time: %5\n\n『 𝐎𝐖𝐍𝐄𝐑 』\n➤ 𝗕𝗮𝗱𝗵𝗼𝗻",
			invalidPrefix: "『 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 』\n\n✦ Invalid prefix! Max 5 characters",
			systemReset: "『 𝐒𝐘𝐒𝐓𝐄𝐌 𝐑𝐄𝐒𝐄𝐓 』\n\n✦ System prefix reset to default: %1\n\n➤ Action by: 𝗕𝗮𝗱𝗵𝗼𝗻"
		}
	},

	onStart: async function ({ message, args, event, threadsData, getLang }) {
		if (event.senderID !== ADMIN_UID) {
			return message.reply(getLang("onlyAdmin"));
		}

		if (!args[0]) {
			const now = new Date();
			const bangladeshTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
			const date = bangladeshTime.toLocaleDateString('en-GB');
			const day = bangladeshTime.toLocaleDateString('en-US', { weekday: 'long' });
			const time = bangladeshTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

			return message.reply(getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID), date, day, time));
		}

		const now = new Date();
		const bangladeshTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
		const date = bangladeshTime.toLocaleDateString('en-GB');
		const day = bangladeshTime.toLocaleDateString('en-US', { weekday: 'long' });
		const time = bangladeshTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

		if (args[0] === 'reset') {
			if (args[1] === "-g") {
				global.GoatBot.config.prefix = global.GoatBot.config.defaultPrefix || "!";
				fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
				try { await message.unsend(event.messageID); } catch (e) {}
				return message.reply(getLang("systemReset", global.GoatBot.config.prefix));
			}
			await threadsData.set(event.threadID, null, "data.prefix");
			try { await message.unsend(event.messageID); } catch (e) {}
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];

		if (newPrefix.length > 5) {
			return message.reply(getLang("invalidPrefix"));
		}

		const formSet = {
			commandName: "prefix",
			author: event.senderID,
			newPrefix,
			setGlobal: args[1] === "-g"
		};

		const confirmMessage = args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread");

		return message.reply(`${confirmMessage}\n\n『 𝐍𝐄𝐖 𝐏𝐑𝐄𝐅𝐈𝐗 』\n✦ ${newPrefix}\n\n『 𝐓𝐈𝐌𝐄 』\n› Date: ${date}\n› Day: ${day}\n› Time: ${time}\n\n『 𝐀𝐃𝐌𝐈𝐍 』\n➤ 𝗕𝗮𝗱𝗵𝗼𝗻\n\n✦ React to confirm ✦`, async (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
			try { await message.unsend(event.messageID); } catch (e) {}
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal, messageID } = Reaction;

		if (event.userID !== ADMIN_UID) return;

		try { await message.unsend(messageID); } catch (e) {}

		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		} else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "prefix") {
			const now = new Date();
			const bangladeshTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
			const date = bangladeshTime.toLocaleDateString('en-GB');
			const day = bangladeshTime.toLocaleDateString('en-US', { weekday: 'long' });
			const time = bangladeshTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

			return message.reply(getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID), date, day, time));
		}
	}
};

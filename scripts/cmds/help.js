const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const activeHelpMessages = new Map();

module.exports = {
	config: {
		name: "help",
		version: "4.0",
		author: "Badhon",
		countDown: 5,
		role: 0,
		category: "Help",
		guide: "{pn} [page]\n{pn} -c <category>\n{pn} -a <author>\n{pn} <command name>",
		priority: 1
	},

	langs: {
		en: {
			help: "『 𝐌𝐄𝐋𝐈𝐒𝐒𝐀 𝐕𝟒 𝐇𝐄𝐋𝐏 』\n\n%1\n\n➤ Page %2/%3\n➤ Commands: %4\n➤ Prefix: %5\n➤ Owner: 𝗕𝗮𝗱𝗵𝗼𝗻\n\n『 %5help <page> 』\n『 %5help -c <category> 』\n『 %5help -a <author> 』\n『 %5help <command> 』",
			categoryHelp: "『 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘: %1 』\n\n%2\n\n➤ Commands: %3\n➤ Prefix: %4\n➤ Owner: 𝗕𝗮𝗱𝗵𝗼𝗻",
			authorHelp: "『 𝐀𝐔𝐓𝐇𝐎𝐑: %1 』\n\n%2\n\n➤ Commands: %3\n➤ Prefix: %4\n➤ Owner: 𝗕𝗮𝗱𝗵𝗼𝗻",
			commandInfo: "『 %1 』\n\n✦ Name: %1\n✦ Aliases: %2\n✦ Version: %3\n✦ Role: %4\n✦ Author: %5\n✦ Category: %6\n\n✦ Description:\n  %7\n\n✦ Usage:\n  %8",
			notFound: "『 𝟰𝟬𝟰 』 %1 not found",
			noPage: "『 𝟰𝟬𝟰 』 Page %1 not found",
			roles: ["Everyone", "Group Admin", "Bot Admin"],
			none: "None"
		}
	},

	onStart: async function({ message, args, event, threadsData, getLang }) {
		const { threadID } = event;
		const prefix = getPrefix(threadID);
		
		if (activeHelpMessages.has(threadID)) {
			const prev = activeHelpMessages.get(threadID);
			try { await message.unsend(prev.messageID); } catch (e) {}
			clearTimeout(prev.timeout);
			activeHelpMessages.delete(threadID);
		}

		const input = args[0]?.toLowerCase() || "";

		if (input === "-c" && args[1]) {
			const category = args[1].toLowerCase();
			const categoryCommands = [];
			
			for (const [name, cmd] of commands) {
				const cmdCategory = (cmd.config.category || "other").toLowerCase();
				if (cmdCategory === category) {
					categoryCommands.push(name);
				}
			}
			
			if (categoryCommands.length === 0) {
				return message.reply(getLang("notFound", `category ${args[1]}`));
			}
			
			categoryCommands.sort();
			const cmdList = categoryCommands.map((name, i) => `  › ${name}`).join("\n");
			
			const msg = await message.reply(getLang("categoryHelp", args[1].toUpperCase(), cmdList, categoryCommands.length, prefix));
			
			const timeout = setTimeout(async () => {
				try { await message.unsend(msg.messageID); } catch (e) {}
				activeHelpMessages.delete(threadID);
			}, 60000);
			
			activeHelpMessages.set(threadID, { messageID: msg.messageID, timeout });
			return;
		}

		if (input === "-a" && args[1]) {
			const author = args.slice(1).join(" ").toLowerCase();
			const authorCommands = [];
			
			for (const [name, cmd] of commands) {
				const cmdAuthor = (cmd.config.author || "").toLowerCase();
				if (cmdAuthor === author) {
					authorCommands.push(name);
				}
			}
			
			if (authorCommands.length === 0) {
				return message.reply(getLang("notFound", `author ${args.slice(1).join(" ")}`));
			}
			
			authorCommands.sort();
			const cmdList = authorCommands.map((name, i) => `  › ${name}`).join("\n");
			
			const msg = await message.reply(getLang("authorHelp", args.slice(1).join(" "), cmdList, authorCommands.length, prefix));
			
			const timeout = setTimeout(async () => {
				try { await message.unsend(msg.messageID); } catch (e) {}
				activeHelpMessages.delete(threadID);
			}, 60000);
			
			activeHelpMessages.set(threadID, { messageID: msg.messageID, timeout });
			return;
		}

		const command = commands.get(input) || commands.get(aliases.get(input));

		if (!command && (!input || !isNaN(input))) {
			const page = parseInt(input) || 1;
			const commandsPerPage = 10;
			const categoriesPerPage = 2;
			
			const categoryMap = new Map();
			for (const [name, cmd] of commands) {
				const category = cmd.config.category || "Other";
				if (!categoryMap.has(category)) categoryMap.set(category, []);
				categoryMap.get(category).push(name);
			}

			const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
			const totalPages = Math.ceil(sortedCategories.length / categoriesPerPage);
			
			if (page < 1 || page > totalPages) {
				return message.reply(getLang("noPage", page));
			}

			const start = (page - 1) * categoriesPerPage;
			const pageCategories = sortedCategories.slice(start, start + categoriesPerPage);
			
			let cmdList = "";
			let totalShown = 0;
			
			pageCategories.forEach(([category, cmdNames]) => {
				cmdList += `『 ${category.toUpperCase()} 』\n`;
				const limitedCommands = cmdNames.sort().slice(0, Math.floor(commandsPerPage / categoriesPerPage));
				limitedCommands.forEach(name => {
					cmdList += `  › ${name}\n`;
					totalShown++;
				});
				cmdList += "\n";
			});

			const msg = await message.reply(getLang("help", cmdList, page, totalPages, commands.size, prefix));
			
			const timeout = setTimeout(async () => {
				try { await message.unsend(msg.messageID); } catch (e) {}
				activeHelpMessages.delete(threadID);
			}, 60000);

			activeHelpMessages.set(threadID, { messageID: msg.messageID, timeout });
			return;
		}

		if (command) {
			const config = command.config;
			const guide = typeof config.guide === "string" ? config.guide : config.guide?.en || "";
			const usage = guide.replace(/\{pn\}/g, prefix + config.name).replace(/\{p\}/g, prefix);
			const aliasesList = config.aliases?.join(", ") || getLang("none");
			const description = typeof config.description === "object" ? config.description.en : config.description || getLang("none");
			const roleText = getLang("roles")[config.role] || "Unknown";

			const msg = await message.reply(getLang("commandInfo",
				config.name,
				aliasesList,
				config.version,
				roleText,
				config.author || "Unknown",
				config.category || "Other",
				description,
				usage || "No usage"
			));

			const timeout = setTimeout(async () => {
				try { await message.unsend(msg.messageID); } catch (e) {}
				activeHelpMessages.delete(threadID);
			}, 60000);

			activeHelpMessages.set(threadID, { messageID: msg.messageID, timeout });
			return;
		}

		message.reply(getLang("notFound", args[0]));
	}
};

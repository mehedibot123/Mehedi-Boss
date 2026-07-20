const textToFont = (text) => {
    const map = {
        a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
        0: "𝟎", 1: "𝟏", 2: "𝟐", 3: "𝟑", 4: "𝟒", 5: "𝟓", 6: "𝟔", 7: "𝟕", 8: "𝟖", 9: "𝟗"
    };
    return text.split("").map(c => map[c] || c).join("");
};

const userCooldowns = new Map();
const globalHistory = []; 
const userStats = new Map(); 
module.exports = {
    config: {
        name: "slot",
        version: "17.0",
        author: "Zihad Ahmed",
        role: 0,
        category: "game",
        countDown: 5
    },

    onStart: async function ({ event, api, usersData, args }) {
        const { threadID, senderID } = event;
        const input = args[0]?.toLowerCase();

        // --- 1. History List (-l / list) ---
        if (input === "-l" || input === "list") {
            if (globalHistory.length === 0) return api.sendMessage(textToFont("📜 𝐍𝐎 𝐇𝐈𝐒𝐓𝐎𝐑𝐘 𝐅𝐎𝐔𝐍𝐃!"), threadID);
            let historyText = "📜 𝐋𝐀𝐒𝐓 𝟏𝟎 𝐒𝐏𝐈𝐍𝐒 𝐇𝐈𝐒𝐓𝐎𝐑𝐘\n━━━━━━━━━━━━━━━━━━\n";
            globalHistory.slice().reverse().forEach((h, i) => {
                historyText += `${i + 1}. ${h.userName} ➔ ${h.status} (${h.amount})\n`;
            });
            return api.sendMessage(textToFont(historyText + "━━━━━━━━━━━━━━━━━━"), threadID);
        }

        // --- 2. User Info (-i / info) ---
        if (input === "-i" || input === "info") {
            const stats = userStats.get(senderID) || { win: 0, lose: 0, totalX: 0, highestWin: 0 };
            const infoText = `
👤 𝐔𝐒𝐄𝐑 𝐒𝐋𝐎𝐓 𝐒𝐓𝐀𝐓𝐒
━━━━━━━━━━━━━━━━━━
✅ 𝐓𝐎𝐓𝐀𝐋 𝐖𝐈𝐍: ${stats.win}
❌ 𝐓𝐎𝐓𝐀𝐋 𝐋𝐎𝐒𝐄: ${stats.lose}
🔥 𝐇𝐈𝐆𝐇𝐄𝐒𝐓 𝐖𝐈𝐍: ${stats.highestWin.toLocaleString()}
📈 𝐀𝐕𝐆 𝐌𝐔𝐋𝐓𝐈𝐏𝐋𝐈𝐄𝐑: ${stats.win > 0 ? (stats.totalX / stats.win).toFixed(1) : 0}𝐗
━━━━━━━━━━━━━━━━━━`.trim();
            return api.sendMessage(textToFont(infoText), threadID);
        }

        // --- Limit & Cooldown ---
        let cooldown = userCooldowns.get(senderID) || { count: 0, time: Date.now() };
        if (Date.now() - cooldown.time > 60 * 60 * 1000) cooldown = { count: 0, time: Date.now() };
        if (cooldown.count >= 40) {
            const timeLeft = (60 * 60 * 1000) - (Date.now() - cooldown.time);
            return api.sendMessage(textToFont(`🛑 𝐋𝐈𝐌𝐈𝐓 𝐑𝐄𝐀𝐂𝐇𝐄𝐃! 𝐖𝐚𝐢𝐭 ${Math.floor(timeLeft/60000)}𝐦 ${Math.floor((timeLeft%60000)/1000)}𝐬`), threadID);
        }

        // --- Money Parsing ---
        const formatMoney = (n) => {
            if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
            if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
            if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
            if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
            return n.toLocaleString();
        };

        let user = await usersData.get(senderID);
        let bet = input === "all" ? user.money : parseFloat(input);
        if (args[0]?.toLowerCase().slice(-1) === "k") bet *= 1e3;
        if (args[0]?.toLowerCase().slice(-1) === "m") bet *= 1e6;

        if (!bet || bet < 500 || bet > 500000000) return api.sendMessage(textToFont("⚠️ slot <amount> | -l | -i"), threadID);
        if (user.money < bet) return api.sendMessage(textToFont(`💸 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: ${formatMoney(user.money)}`), threadID);

        user.money -= bet;
        await usersData.set(senderID, user);

        const icons = ["🍒", "🍋", "💎", "⭐", "🔔", "🍇", "🔥"];
        const loadingMsg = await api.sendMessage(textToFont("🎰 𝐒𝐏𝐈𝐍𝐍𝐈𝐍𝐆..."), threadID);

        setTimeout(async () => {
            const winChance = Math.random();
            let finalRoll = [], multiplier = 0, resultStatus = "𝐋𝐎𝐒𝐄";

            if (winChance < 0.35) { 
                multiplier = 5 + Math.floor(Math.random() * 6);
                resultStatus = "𝐉𝐀𝐂𝐊𝐏𝐎𝐓";
                finalRoll = Array(3).fill(icons[Math.floor(Math.random()*7)]);
            } else if (winChance < 0.65) {
                multiplier = 2 + Math.floor(Math.random() * 2);
                resultStatus = "𝐖𝐈𝐍";
                const winIcon = icons[Math.floor(Math.random()*7)];
                finalRoll = [winIcon, winIcon, icons.find(i => i !== winIcon)];
            } else {
                multiplier = 0;
                finalRoll = [icons[0], icons[1], icons[2]].sort(() => Math.random() - 0.5);
            }

            const wonAmount = bet * multiplier;
            user.money += wonAmount;
            await usersData.set(senderID, user);

            // --- Update Stats & History ---
            const stats = userStats.get(senderID) || { win: 0, lose: 0, totalX: 0, highestWin: 0 };
            if (multiplier > 0) {
                stats.win++;
                stats.totalX += multiplier;
                if (wonAmount > stats.highestWin) stats.highestWin = wonAmount;
            } else {
                stats.lose++;
            }
            userStats.set(senderID, stats);

            const userName = (await usersData.get(senderID)).name || "User";
            globalHistory.push({ userName, status: resultStatus, amount: formatMoney(wonAmount || bet) });
            if (globalHistory.length > 10) globalHistory.shift();

            cooldown.count++;
            userCooldowns.set(senderID, cooldown);

            const response = `
🎰 𝐒𝐋𝐎𝐓 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄 🎰
━━━━━━━━━━━━━━━━━━
     | ${finalRoll.join(" | ")} |
━━━━━━━━━━━━━━━━━━
✨ 𝐒𝐓𝐀𝐓𝐔𝐒: ${resultStatus}
💰 𝐖𝐎𝐍: +$${formatMoney(wonAmount)}
📉 𝐁𝐄𝐓: -$${formatMoney(bet)}
💎 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: $${formatMoney(user.money)}
🎫 𝐋𝐈𝐌𝐈𝐓: ${cooldown.count}/𝟒𝟎
━━━━━━━━━━━━━━━━━━`.trim();

            await api.editMessage(textToFont(response), loadingMsg.messageID);
        }, 1200);
    }
};

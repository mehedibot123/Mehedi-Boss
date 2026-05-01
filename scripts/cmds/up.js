const os = require("os");
const { execSync } = require("child_process");

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function getUptime() {
  const uptimeSec = process.uptime();
  const days = Math.floor(uptimeSec / (3600 * 24));
  const hours = Math.floor((uptimeSec % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = Math.floor(uptimeSec % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

function createProgressBar(percentage, length = 10) {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "▒".repeat(empty);
}

function getNetworkInfo() {
  try {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
      for (const iface of interfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "status"],
    version: "2.0",
    author: "Badhon",
    countDown: 5,
    role: 0,
    category: "System",
    guide: "{pn}"
  },

  langs: {
    en: {
      uptime: "『 𝐌𝐄𝐋𝐈𝐒𝐒𝐀 𝐔𝐏𝐓𝐈𝐌𝐄 』\n\n『 𝐔𝐏𝐓𝐈𝐌𝐄 』\n✦ %1\n\n『 𝐒𝐓𝐀𝐓𝐒 』\n✦ Users: %2\n✦ Groups: %3\n✦ Threads: %4\n\n『 𝐒𝐘𝐒𝐓𝐄𝐌 』\n✦ OS: %5\n✦ Platform: %6\n✦ Node: %7\n✦ IP: %8\n\n『 𝐂𝐏𝐔 』\n✦ %9\n✦ Cores: %10\n✦ Load: %11\n\n『 𝐑𝐀𝐌 』\n✦ [%12] %13%\n✦ Used: %14\n✦ Free: %15\n✦ Total: %16\n\n『 𝐎𝐖𝐍𝐄𝐑 』\n➤ 𝗕𝗮𝗱𝗵𝗼𝗻",
      error: "『 𝐄𝐑𝐑𝐎𝐑 』\n\n✦ Could not fetch system info"
    }
  },

  onStart: async function ({ message, threadsData, usersData, getLang }) {
    try {
      const uptime = getUptime();
      const threads = await threadsData.getAll();
      const users = (await usersData.getAll()).length;
      const groups = threads.filter(t => t.threadInfo?.isGroup).length;
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsage = ((usedMem / totalMem) * 100).toFixed(1);
      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model || "Unknown";
      const cpuCores = cpus.length;
      const nodeVersion = process.version;
      const platform = os.platform();
      const ip = getNetworkInfo();
      const loadAvg = os.loadavg().map(l => l.toFixed(2)).join(' / ');

      const msg = getLang("uptime",
        uptime,
        users,
        groups,
        threads.length,
        `${os.type()} ${os.release()}`,
        platform,
        nodeVersion,
        ip,
        cpuModel,
        cpuCores,
        loadAvg,
        createProgressBar(memUsage),
        memUsage,
        formatBytes(usedMem),
        formatBytes(freeMem),
        formatBytes(totalMem)
      );

      return message.reply(msg);
    } catch (error) {
      console.error("Uptime error:", error);
      return message.reply(getLang("error"));
    }
  }
};

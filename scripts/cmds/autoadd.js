this.config = {
    name: "autoadd",
    timezone: "Asia/Dhaka",
    author: "Badhon",
    version: "5.2.0",
    dependencies: {
        "fb-api": "latest"
    }
};

// Store active status per thread
const activeThreads = new Map();

module.exports = {
    config: this.config,
    
    onLoad: function({ api }) {
        console.log('\x1b[32m%s\x1b[0m', `[AUTOADD PRO] v${this.config.version} loaded successfully`);
        console.log('\x1b[36m%s\x1b[0m', `Maintained by: ${this.config.author}`);
    },
    
    handleCommand: async function({ api, event, args }) {
        try {
            const threadID = event.threadID;
            const senderID = event.senderID;
            const command = args[0]?.toLowerCase();

            // Get thread info to check admin status
            const threadInfo = await api.getThreadInfo(threadID);
            const isAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);
            const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id === api.getCurrentUserID());

            if (!isAdmin) {
                return api.sendMessage("❌ Only group admins can control AutoAdd.", threadID);
            }

            switch (command) {
                case 'on':
                case 'activate':
                case 'active':
                    if (!isBotAdmin) {
                        return api.sendMessage(
                            "⚠️ Please make the bot an admin first to enable AutoAdd.",
                            threadID
                        );
                    }
                    activeThreads.set(threadID, true);
                    return api.sendMessage(
                        "✅ AutoAdd ACTIVATED\n" +
                        "The bot will now automatically re-add users who leave or get kicked.",
                        threadID
                    );

                case 'off':
                case 'deactivate':
                case 'inactive':
                    activeThreads.set(threadID, false);
                    return api.sendMessage(
                        "⛔ AutoAdd DEACTIVATED\n" +
                        "The bot will no longer automatically re-add users.",
                        threadID
                    );

                case 'status':
                    const status = activeThreads.get(threadID) ? "ACTIVE" : "INACTIVE";
                    return api.sendMessage(
                        `🔄 AutoAdd Status: ${status}\n` +
                        `Admin Controls:\n` +
                        `• /autoadd active - Enable feature\n` +
                        `• /autoadd inactive - Disable feature`,
                        threadID
                    );

                default:
                    return api.sendMessage(
                        "AutoAdd Command Usage:\n" +
                        "🔹 /autoadd active - Enable auto-re-add\n" +
                        "🔹 /autoadd inactive - Disable auto-re-add\n" +
                        "🔹 /autoadd status - Check current status\n\n" +
                        `Current Version: ${this.config.version}`,
                        threadID
                    );
            }
        } catch (error) {
            console.error('[COMMAND ERROR]', error);
            api.sendMessage(
                "❌ An error occurred while processing your command.",
                event.threadID
            );
        }
    },
    
    onStart: async function({ api, event }) {
        try {
            const threadID = event.threadID;

            // Check if feature is active for this thread
            if (!activeThreads.get(threadID)) {
                return; // Feature not active for this thread
            }

            if (event.threadID === event.senderID) {
                return api.sendMessage("❌ AutoAdd only works in group chats.", event.senderID);
            }

            // Check admin status
            const threadInfo = await api.getThreadInfo(threadID);
            const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id === api.getCurrentUserID());
            
            if (!isBotAdmin) {
                activeThreads.set(threadID, false); // Auto-deactivate if bot loses admin
                return api.sendMessage(
                    "⚠️ AutoAdd disabled - Bot lost admin privileges.\n" +
                    "Use '/autoadd active' after making bot admin again.",
                    threadID
                );
            }

            // Enhanced re-add handler
            const handleReAdd = async (userID, actionType, attempt = 1) => {
                if (!activeThreads.get(threadID)) return; // Double-check if still active

                try {
                    const currentThreadInfo = await api.getThreadInfo(threadID);
                    
                    if (!currentThreadInfo.participantIDs.includes(userID)) {
                        try {
                            await api.addUserToGroup(userID, threadID);
                            console.log(`[SUCCESS] Re-added ${actionType} user: ${userID}`);
                        } catch (err) {
                            if (attempt <= 3) {
                                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                                return handleReAdd(userID, actionType, attempt + 1);
                            }
                            console.error(`[FAILED] Couldn't re-add ${userID}`, err);
                        }
                    }
                } catch (threadErr) {
                    console.error('[THREAD INFO ERROR]', threadErr);
                }
            };

            // Event listener
            let processing = false;
            const debouncedListener = async (err, mqttEvent) => {
                if (err || processing || !activeThreads.get(threadID)) return;
                processing = true;
                
                try {
                    if (mqttEvent.type === "event" && mqttEvent.logMessageType) {
                        const { logMessageData } = mqttEvent;
                        
                        if (mqttEvent.logMessageType === "log:unsubscribe") {
                            await handleReAdd(logMessageData.leftParticipantFbId, 'leave');
                        }
                        else if (mqttEvent.logMessageType === "log:thread-admin" && 
                                 logMessageData.TARGET_ID && 
                                 logMessageData.ADMIN_EVENT === "admin_remove_member") {
                            await handleReAdd(logMessageData.TARGET_ID, 'kick');
                        }
                    }
                } catch (e) {
                    console.error('[EVENT PROCESSING ERROR]', e);
                } finally {
                    setTimeout(() => { processing = false; }, 1000);
                }
            };

            api.listenMqtt(debouncedListener);

        } catch (error) {
            console.error('[AUTOADD ERROR]', error);
        }
    },
    
    onShutdown: function() {
        console.log('\x1b[33m%s\x1b[0m', '[AUTOADD] Shutting down...');
        activeThreads.clear();
    }
};

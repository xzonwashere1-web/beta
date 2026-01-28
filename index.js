const { Client, GatewayIntentBits, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});
const afkMap = new Map();

const PREFIX = ',';

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // REMOVE AFK WHEN USER SENDS ANY MESSAGE
    if (afkMap.has(message.author.id)) {
        afkMap.delete(message.author.id);

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('💤 **AFK Removed**'),
                new TextDisplayBuilder().setContent('Welcome back! You are no longer marked as AFK.')
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // NOTIFY IF MENTIONED USER IS AFK
    if (message.mentions.users.size > 0) {
        message.mentions.users.forEach(user => {
            if (afkMap.has(user.id)) {
                const reason = afkMap.get(user.id);

                const container = new ContainerBuilder()
                    .setAccentColor(0x2B2D31)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('💤 **User is AFK**'),
                        new TextDisplayBuilder().setContent(
                            `**${user.tag}** is currently AFK.\n` +
                            `**Reason:** ${reason || 'No reason provided.'}`
                        )
                    );

                message.reply({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        });
    }

    // STOP HERE IF MESSAGE DOESN'T START WITH PREFIX
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();


    // PING COMMAND
    if (command === 'ping') {
        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('🏓 **Pong!**'),
                new TextDisplayBuilder().setContent(
                    `**Latency:** ${client.ws.ping}ms\n` +
                    `**API Latency:** ${Date.now() - message.createdTimestamp}ms`
                )
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // AFK COMMAND
    else if (command === 'afk') {
        const reason = args.join(' ') || 'No reason provided.';
        afkMap.set(message.author.id, reason);

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('💤 **AFK Enabled**'),
                new TextDisplayBuilder().setContent(
                    `You are now marked as AFK.\n` +
                    `**Reason:** ${reason}`
                )
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // UPTIME COMMAND
    else if (command === 'uptime') {
        const totalSeconds = Math.floor(client.uptime / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('⏱️ **Bot Uptime**'),
                new TextDisplayBuilder().setContent(
                    `**Time Online:**\n` +
                    `${days}d ${hours}h ${minutes}m ${seconds}s`
                )
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // AVATAR COMMAND
    else if (command === 'avatar') {
        const user = message.mentions.users.first() || message.author;
        const avatarURL = user.displayAvatarURL({ size: 4096, dynamic: true });

        message.reply(avatarURL);
    }

    // BANNER COMMAND
    else if (command === 'banner') {
        const user = message.mentions.users.first() || message.author;
        const fetchedUser = await user.fetch();
        const bannerURL = fetchedUser.bannerURL({ size: 4096, dynamic: true });

        if (!bannerURL) {
            const container = new ContainerBuilder()
                .setAccentColor(0x2B2D31)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('❌ **No Banner**'),
                    new TextDisplayBuilder().setContent(`${user.tag} does not have a banner.`)
                );

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        message.reply(bannerURL);
    }

    // ROLEINFO COMMAND
    else if (command === 'roleinfo') {
        const role = message.mentions.roles.first();
        
        if (!role) {
            const container = new ContainerBuilder()
                .setAccentColor(0x2B2D31)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('⚠️ **Invalid Usage**'),
                    new TextDisplayBuilder().setContent('Please mention a role.\nUsage: `,roleinfo @role`')
                );

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('📛 **Role Information**'),
                new TextDisplayBuilder().setContent(
                    `**Name:** ${role.name}\n` +
                    `**ID:** ${role.id}\n` +
                    `**Color:** ${role.hexColor}\n` +
                    `**Members:** ${role.members.size}\n` +
                    `**Position:** ${role.position}\n` +
                    `**Mentionable:** ${role.mentionable ? 'Yes' : 'No'}\n` +
                    `**Hoisted:** ${role.hoist ? 'Yes' : 'No'}`
                )
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // MEMBERCOUNT COMMAND
    else if (command === 'membercount') {
        const guild = message.guild;
        const totalMembers = guild.memberCount;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const humans = totalMembers - bots;

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('👥 **Member Count**'),
                new TextDisplayBuilder().setContent(
                    `**Total Members:** ${totalMembers}\n` +
                    `**Humans:** ${humans}\n` +
                    `**Bots:** ${bots}`
                )
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // USERINFO COMMAND
    else if (command === 'userinfo') {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('👤 **User Information**'),
                new TextDisplayBuilder().setContent(
                    `**Username:** ${user.tag}\n` +
                    `**ID:** ${user.id}\n` +
                    `**Account Created:** ${user.createdAt.toLocaleDateString()}\n` +
                    `**Joined Server:** ${member.joinedAt.toLocaleDateString()}\n` +
                    `**Roles:** ${member.roles.cache.map(r => r.name).filter(n => n !== '@everyone').join(', ') || 'None'}`
                )
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // SERVERINFO COMMAND
    else if (command === 'serverinfo') {
        const guild = message.guild;

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('🏠 **Server Information**'),
                new TextDisplayBuilder().setContent(
                    `**Name:** ${guild.name}\n` +
                    `**ID:** ${guild.id}\n` +
                    `**Owner:** <@${guild.ownerId}>\n` +
                    `**Members:** ${guild.memberCount}\n` +
                    `**Created:** ${guild.createdAt.toLocaleDateString()}\n` +
                    `**Channels:** ${guild.channels.cache.size}\n` +
                    `**Roles:** ${guild.roles.cache.size}`
                )
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // WEATHER COMMAND
    else if (command === 'weather') {
        if (!args[0]) {
            const container = new ContainerBuilder()
                .setAccentColor(0x2B2D31)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('⚠️ **Invalid Usage**'),
                    new TextDisplayBuilder().setContent('Please provide a location.\nUsage: `,weather <location>`')
                );

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const location = args.join(' ');

        try {
            const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
            const data = await response.json();

            if (!data.current_condition) {
                const container = new ContainerBuilder()
                    .setAccentColor(0x2B2D31)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('❌ **Location Not Found**'),
                        new TextDisplayBuilder().setContent(`Could not find weather data for "${location}".`)
                    );

                return message.reply({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const current = data.current_condition[0];
            const area = data.nearest_area[0];

            const container = new ContainerBuilder()
                .setAccentColor(0x2B2D31)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`🌤️ **Weather in ${area.areaName[0].value}, ${area.country[0].value}**`),
                    new TextDisplayBuilder().setContent(
                        `**Temperature:** ${current.temp_C}°C / ${current.temp_F}°F\n` +
                        `**Feels Like:** ${current.FeelsLikeC}°C / ${current.FeelsLikeF}°F\n` +
                        `**Condition:** ${current.weatherDesc[0].value}\n` +
                        `**Humidity:** ${current.humidity}%\n` +
                        `**Wind:** ${current.windspeedKmph} km/h ${current.winddir16Point}\n` +
                        `**Pressure:** ${current.pressure} mb\n` +
                        `**Visibility:** ${current.visibility} km`
                    )
                );

            message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            const container = new ContainerBuilder()
                .setAccentColor(0x2B2D31)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('❌ **Error**'),
                    new TextDisplayBuilder().setContent('Failed to fetch weather data. Please try again later.')
                );

            message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }

    // INVITE COMMAND
    else if (command === 'invite') {
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('🔗 **Invite Link**'),
                new TextDisplayBuilder().setContent(
                    `Click the link below to invite me to your server!\n\n` +
                    `${inviteLink}`
                )
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // BOTINFO COMMAND
    else if (command === 'botinfo') {
        const totalSeconds = Math.floor(client.uptime / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        const totalServers = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('🤖 **Bot Information**'),
                new TextDisplayBuilder().setContent(
                    `**Bot Name:** ${client.user.tag}\n` +
                    `**Bot ID:** ${client.user.id}\n` +
                    `**Version:** 1.1.1\n` +
                    `**Uptime:** ${days}d ${hours}h ${minutes}m\n` +
                    `**Servers:** ${totalServers}\n` +
                    `**Users:** ${totalUsers}\n` +
                    `**Channels:** ${totalChannels}\n` +
                    `**Ping:** ${client.ws.ping}ms\n` +
                    `**Created:** ${client.user.createdAt.toLocaleDateString()}`
                )
            );

        message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // HELP COMMAND
    else if (command === 'help') {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('📋 **Rambler Bot - Help Menu**'),
                new TextDisplayBuilder().setContent(
                    `Prefix: \`,\`\n` +
                    `Total Commands: 13\n` +
                    `Bot Version: 1.1.1\n\n` +
                    `Changelog:\n` +
                    `• Added AFK system with \`,afk [reason]\` command.\n` +
                    `• Users are notified when mentioning AFK users.\n` +
                    `• AFK status is removed when the user sends a message.\n` +
                    `• Added utility commands: weather, invite, botinfo.\n\n` +
                    
                    `Select a category below to view all available commands.\n` +
                    `Each category contains specific commands for different purposes.`
                )
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_bot')
                    .setLabel('Bot')
                    .setEmoji('⚙️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_user')
                    .setLabel('User')
                    .setEmoji('👤')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_server')
                    .setLabel('Server')
                    .setEmoji('🏠')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_fun')
                    .setLabel('Fun')
                    .setEmoji('🎮')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_misc')
                    .setLabel('Misc')
                    .setEmoji('🔧')
                    .setStyle(ButtonStyle.Primary)
            );

        message.reply({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }
});

// Handle button interactions for help menu
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_bot')
                .setLabel('Bot')
                .setEmoji('⚙️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_user')
                .setLabel('User')
                .setEmoji('👤')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_server')
                .setLabel('Server')
                .setEmoji('🏠')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_fun')
                .setLabel('Fun')
                .setEmoji('🎮')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_misc')
                .setLabel('Misc')
                .setEmoji('🔧')
                .setStyle(ButtonStyle.Primary)
        );

    if (interaction.customId === 'help_home') {
        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('📋 **Rambler Bot - Help Menu**'),
                new TextDisplayBuilder().setContent(
                    `Prefix: \`,\`\n` +
                    `Total Commands: 10\n` +
                    `Bot Version: 1.1.1\n\n` +
                    `Changelog:\n` +
                    `• Added AFK system with \`,afk [reason]\` command.\n` +
                    `• Users are notified when mentioning AFK users.\n` +
                    `• AFK status is removed when the user sends a message.\n\n` +
                    
                    `Select a category below to view all available commands.\n` +
                    `Each category contains specific commands for different purposes.`
                )
            );

        await interaction.update({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }

    else if (interaction.customId === 'help_bot') {
        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('⚙️ **Bot Commands**'),
                new TextDisplayBuilder().setContent(
                    'Commands related to bot statistics and information.\n' +
                    'These commands help you monitor the bot\'s performance and status.\n\n'
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                    .setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '`,ping`\n' +
                    'Check bot latency and response time.\n' +
                    'Shows WebSocket ping and API response time.\n\n' +
                    '`,uptime`\n' +
                    'View how long the bot has been online.\n' +
                    'Displays days, hours, minutes, and seconds.' + '\n\n' +
                    '`,botinfo`\n' +
                    'Display detailed bot information including version, uptime,\n' +
                    'and other relevant statistics.'
                )
            );

        await interaction.update({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }

    else if (interaction.customId === 'help_user') {
        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('👤 **User Commands**'),
                new TextDisplayBuilder().setContent(
                    'Commands to get information about Discord users.\n' +
                    'View profiles, avatars, banners, and more.\n\n'
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                    .setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '`,userinfo [@user]`\n' +
                    'Display detailed user information including account creation date,\n' +
                    'server join date, roles, and more. Mention optional.\n\n' +
                    '`,avatar [@user]`\n' +
                    'Show user\'s avatar in full 4096px resolution.\n' +
                    'Perfect for downloading profile pictures. Mention optional.\n\n' +
                    '`,banner [@user]`\n' +
                    'Show user\'s profile banner in full resolution.\n' +
                    'Only works if user has a banner set. Mention optional.'
                )
            );

        await interaction.update({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }

    else if (interaction.customId === 'help_server') {
        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('🏠 **Server Commands**'),
                new TextDisplayBuilder().setContent(
                    'Commands to get server and role information.\n' +
                    'View server stats, member counts, and role details.\n\n'
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                    .setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '`,serverinfo`\n' +
                    'Display comprehensive server information including name, ID,\n' +
                    'owner, creation date, total channels, and roles.\n\n' +
                    '`,membercount`\n' +
                    'View detailed member statistics with breakdown of total members,\n' +
                    'human users, and bot accounts in the server.\n\n' +
                    '`,roleinfo @role`\n' +
                    'Get detailed information about a specific role including\n' +
                    'color, position, permissions, and member count.\n\n' +
                   '`,invite`\n' +
                    'Generate an invite link to add the bot to your own server.\n\n'
               
                )
            );

        await interaction.update({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }

    else if (interaction.customId === 'help_fun') {
        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('🎮 **Fun Commands**'),
                new TextDisplayBuilder().setContent(
                    'Entertainment and game commands.\n' +
                    'More commands will be added to this category soon!\n\n'
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                    .setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    'No fun commands available yet.\n\n' +
                    'Future commands may include:\n' +
                    '• Mini games\n' +
                    '• Random generators\n' +
                    '• Entertainment features\n\n' +
                    'Stay tuned for updates!'
                )
            );

        await interaction.update({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }

    else if (interaction.customId === 'help_misc') {
        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('🔧 **Miscellaneous Commands**'),
                new TextDisplayBuilder().setContent(
                    'Utility and miscellaneous commands.\n\n'
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                    .setDivider(true)
            )
            .addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
        '`,afk [reason]`\n' +
        'Set your status as AFK (Away From Keyboard) with an optional reason.\n' +
        'Notifies others when they mention you while AFK.\n' +
        'AFK status is automatically removed when you send a message.\n\n' +
        'More commands coming soon!\n\n' +
        '`,weather <location>`\n' +
        'Get current weather information for a specified location.\n' +
        'Provides temperature, humidity, wind speed, and more.\n'
    )
);


        await interaction.update({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2
        });
    }
});



client.login(process.env.DISCORD_TOKEN);

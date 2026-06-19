require('dotenv').config();

const fs = require('fs');

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

const warnings = new Map();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// PREFIX SYSTEM
// =========================

let PREFIX = '?';

if (fs.existsSync('./prefix.json')) {
  PREFIX = JSON.parse(
    fs.readFileSync('./prefix.json')
  ).prefix;
}

function savePrefix() {
  fs.writeFileSync(
    './prefix.json',
    JSON.stringify({
      prefix: PREFIX
    })
  );
}

// =========================
// ROLE CHECKS
// =========================

function hasRole(member, roleName) {
  return member.roles.cache.some(
    role =>
      role.name.toLowerCase() ===
      roleName.toLowerCase()
  );
}

function isOwnerOrAdmin(member) {
  return (
    hasRole(member, 'Owner') ||
    hasRole(member, 'Admin') ||
    member.permissions.has(
      PermissionsBitField.Flags.Administrator
    )
  );
}

function isModerator(member) {
  return (
    hasRole(member, 'Moderator') ||
    member.permissions.has(
      PermissionsBitField.Flags.ModerateMembers
    )
  );
}

// =========================
// READY EVENT
// =========================

client.once('clientReady', async () => {

  console.log(
    `${client.user.tag} is online!`
  );

  client.user.setPresence({
    activities: [
      {
        name: 'Krunker Mumbai',
        type: 3
      }
    ],
    status: 'online'
  });

});

// =========================
// WELCOME SYSTEM
// =========================

client.on(
  'guildMemberAdd',
  async member => {

    const channel =
      member.guild.channels.cache.find(
        c =>
          c.name.includes('welcome') &&
          c.type === ChannelType.GuildText
      );

    if (!channel) return;

    const embed =
      new EmbedBuilder()

        .setColor('#ff0000')

        .setTitle(
          '🎉 Welcome to Krunker Mumbai'
        )

        .setDescription(
`Welcome ${member}

Read the rules and enjoy your stay.`
        )

        .setThumbnail(
          member.user.displayAvatarURL({
            dynamic: true
          })
        )

        .setFooter({
          text:
            `Member #${member.guild.memberCount}`
        })

        .setTimestamp();

    channel.send({
      embeds: [embed]
    });

  }
);

// =========================
// MESSAGE CREATE
// =========================

client.on(
  'messageCreate',
  async message => {

    if (message.author.bot) return;
    if (!message.guild) return;

    // =========================
    // PREFIX CHECK
    // =========================

    if (
      !message.content.startsWith(PREFIX)
    ) return;

    const args = message.content
      .slice(PREFIX.length)
      .trim()
      .split(/ +/);

    const command =
      args.shift()?.toLowerCase();

    // =========================
// HELP
// =========================

if (command === 'help') {

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('📖 Command List')
        .setDescription(`Prefix: ${PREFIX}`)

        .addFields(

            {
                name: '🛠 Utility',
                value:
`?help
?ping
?avatar
?av
?userinfo
?ui
?serverinfo
?channelinfo
?membercount
?roleinfo
?rolelist
?botinfo`
            },

            {
                name: '🔨 Moderation',
                value:
`?ban
?unban
?kick
?timeout
?untimeout
?warn
?warnings
?clearwarns
?nickname
?nick
?purge
?slowmode
?lock
?unlock
?role`
            },

            {
                name: '📢 Management',
                value:
`?announce
?say
?partnerships
?prefix`
            },

            {
                name: '📜 Server',
                value:
`?rules
?pickuprules`
            }
        );

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
    // PING
    // =========================

    if (command === 'ping') {

      return message.channel.send(
        `🏓 Pong: ${client.ws.ping}ms`
      );
    }

    // =========================
    // SAY
    // =========================

    if (command === 'say') {

      if (
    !message.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
    )
) return;

      const text =
        args.join(' ');

      if (!text) return;

      await message.delete().catch(() => {});

      return message.channel.send(text);
    }

    // =========================
// ANNOUNCE
// =========================

if (command === 'announce') {

```
if (
    !message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
    )
) {
    return message.channel.send(
        '❌ You need Administrator permission.'
    );
}

const parts =
    message.content.match(
        /\{([\s\S]*?)\}/g
    );

if (
    !parts ||
    parts.length < 4
) {
    return message.channel.send(
        'Usage:\n?announce {message} {channel/channel_id} {role/everyone/here} {from}'
    );
}

const announcementText =
    parts[0]
        .slice(1, -1)
        .trim();

const channelArg =
    parts[1]
        .slice(1, -1)
        .trim();

const pingArg =
    parts[2]
        .slice(1, -1)
        .trim();

const authorName =
    parts[3]
        .slice(1, -1)
        .trim();

const targetChannel =

    message.guild.channels.cache.get(
        channelArg
    ) ||

    message.guild.channels.cache.find(
        c =>
            c.name.toLowerCase() ===
            channelArg.toLowerCase()
    );

if (!targetChannel) {
    return message.channel.send(
        '❌ Channel not found.'
    );
}

let pingText = '';

if (
    pingArg.toLowerCase() ===
    'everyone'
) {

    pingText = '@everyone';

} else if (
    pingArg.toLowerCase() ===
    'here'
) {

    pingText = '@here';

} else {

    const role =

        message.guild.roles.cache.get(
            pingArg
        ) ||

        message.guild.roles.cache.find(
            r =>
                r.name.toLowerCase() ===
                pingArg.toLowerCase()
        );

    if (role) {
        pingText =
            `<@&${role.id}>`;
    }
}

const embed =
    new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({
            name: authorName,
            iconURL:
                message.guild.iconURL({
                    dynamic: true
                }) || undefined
        })
        .setDescription(
            announcementText
        )
        .setThumbnail(
            message.guild.iconURL({
                dynamic: true,
                size: 1024
            })
        )
        .setFooter({
            text:
                `${message.guild.name}`
        })
        .setTimestamp();

await targetChannel.send({
    content:
        pingText || null,
    embeds: [embed]
});

return message.channel.send(
    `✅ Announcement sent to ${targetChannel}`
);
```

}

// =========================
    // PARTNERSHIPS
    // =========================

    if (command === 'partnerships') {

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🤝 KM Partnerships')
        .setDescription(`
### Clans

🔻 **No Lifes**
[nL Clan](https://discord.gg/dKEUveB7ha)
🔻 **Rampage**
[RMPG Clan](https://discord.gg/SrDhfQbeQU)
        `)
        .setImage('https://media.discordapp.net/attachments/1384997597084647559/1507304224608751616/ChatGPT_Image_May_22_2026_02_18_32_PM.png')
        .setFooter({
            text: 'Krunker Mumbai Partnerships'
        })
        .setTimestamp();

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
    // PREFIX
    // =========================

    if (command === 'prefix') {

      if (
    !message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
    )
) {
        return message.channel.send(
          'No permission.'
        );
      }

      if (!args[0]) {

        return message.channel.send(
          `Current Prefix: ${PREFIX}`
        );
      }

      if (
        args[0] === 'set'
      ) {

        if (!args[1]) {

          return message.channel.send(
            'Provide a prefix.'
          );
        }

        PREFIX = args[1];

        savePrefix();

        return message.channel.send(
          `✅ Prefix changed to ${PREFIX}`
        );
      }

      if (
        args[0] === 'reset'
      ) {

        PREFIX = '?';

        savePrefix();

        return message.channel.send(
          '✅ Prefix reset.'
        );
      }
    }

    // =========================
    // AVATAR
    // =========================

if (command === 'avatar' || command === 'av') {

    let user = null;

    // Mention
    if (message.mentions.users.size > 0) {
        user = message.mentions.users.first();
    }

    // User ID
    else if (args[0]) {
        try {
            user = await client.users.fetch(args[0]);
        } catch {
            user = message.author;
        }
    }

    // Self
    else {
        user = message.author;
    }

    const avatar = user.displayAvatarURL({
        dynamic: true,
        size: 4096
    });

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({
            name: `${user.tag}'s Avatar`
        })
        .setImage(avatar)
        .setFooter({
            text: `ID: ${user.id}`
        })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Open Avatar')
            .setStyle(ButtonStyle.Link)
            .setURL(avatar)
    );

    return message.channel.send({
        embeds: [embed],
        components: [row]
    });
}
    // =========================
// MEMBERCOUNT
// =========================

if (command === 'membercount') {

    const humans =
        message.guild.members.cache.filter(
            m => !m.user.bot
        ).size;

    const bots =
        message.guild.members.cache.filter(
            m => m.user.bot
        ).size;

    return message.channel.send(
        `👥 Members: ${message.guild.memberCount}\n🧑 Humans: ${humans}\n🤖 Bots: ${bots}`
    );
}
    // =========================
    // USERINFO
    // =========================

    if (
    command === 'userinfo' ||
    command === 'ui'
) {

    const member =
        message.mentions.members.first() ||
        message.member;

    const roles =
        member.roles.cache
            .filter(r => r.id !== message.guild.id)
            .map(r => r.toString())
            .join(', ') || 'None';

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({
            name: member.user.tag,
            iconURL: member.user.displayAvatarURL({
                dynamic: true
            })
        })
        .setThumbnail(
            member.user.displayAvatarURL({
                dynamic: true,
                size: 4096
            })
        )
        .addFields(
            {
                name: '👤 Username',
                value: member.user.username,
                inline: true
            },
            {
                name: '🏷 Display Name',
                value: member.displayName,
                inline: true
            },
            {
                name: '🆔 User ID',
                value: member.user.id,
                inline: true
            },
            {
                name: '📅 Account Created',
                value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`,
                inline: false
            },
            {
                name: '📥 Joined Server',
                value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                inline: false
            },
            {
                name: '🎭 Highest Role',
                value: `${member.roles.highest}`,
                inline: true
            },
            {
                name: '📊 Role Count',
                value: `${member.roles.cache.size - 1}`,
                inline: true
            },
            {
                name: '🚀 Server Booster',
                value: member.premiumSince ? 'Yes' : 'No',
                inline: true
            },
            {
                name: '🤖 Bot Account',
                value: member.user.bot ? 'Yes' : 'No',
                inline: true
            },
            {
                name: '⏳ Timed Out',
                value: member.isCommunicationDisabled() ? 'Yes' : 'No',
                inline: true
            },
            {
                name: '🎭 Roles',
                value: roles.length > 1024 ? 'Too many roles.' : roles,
                inline: false
            }
        )
        .setFooter({
            text: `ID: ${member.user.id}`
        })
        .setTimestamp();

    return message.channel.send({
        embeds: [embed]
    });
}

    // =========================
    // SERVERINFO
    // =========================

    if (command === 'serverinfo') {

    const guild = message.guild;

    const humans =
        guild.members.cache.filter(
            m => !m.user.bot
        ).size;

    const bots =
        guild.members.cache.filter(
            m => m.user.bot
        ).size;

    const textChannels =
        guild.channels.cache.filter(
            c => c.type === ChannelType.GuildText
        ).size;

    const voiceChannels =
        guild.channels.cache.filter(
            c => c.type === ChannelType.GuildVoice
        ).size;

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL({
                dynamic: true
            })
        })
        .setThumbnail(
            guild.iconURL({
                dynamic: true
            })
        )
        .addFields(
            {
                name: '👑 Owner',
                value: `<@${guild.ownerId}>`,
                inline: true
            },
            {
                name: '🆔 Server ID',
                value: guild.id,
                inline: true
            },
            {
                name: '📅 Created',
                value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                inline: false
            },
            {
                name: '👥 Members',
                value: `${guild.memberCount}`,
                inline: true
            },
            {
                name: '🙍 Humans',
                value: `${humans}`,
                inline: true
            },
            {
                name: '🤖 Bots',
                value: `${bots}`,
                inline: true
            },
            {
                name: '🎭 Roles',
                value: `${guild.roles.cache.size}`,
                inline: true
            },
            {
                name: '💬 Text Channels',
                value: `${textChannels}`,
                inline: true
            },
            {
                name: '🔊 Voice Channels',
                value: `${voiceChannels}`,
                inline: true
            },
            {
                name: '🚀 Boost Level',
                value: `${guild.premiumTier}`,
                inline: true
            },
            {
                name: '✨ Boosts',
                value: `${guild.premiumSubscriptionCount || 0}`,
                inline: true
            },
            {
                name: '😀 Emojis',
                value: `${guild.emojis.cache.size}`,
                inline: true
            }
        )
        .setFooter({
            text: `Server ID: ${guild.id}`
        })
        .setTimestamp();

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
// PURGE
// =========================

if (command === 'purge') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.ManageMessages
        )
    ) {
        return message.channel.send(
            '❌ You need Manage Messages permission.'
        );
    }

    const amount =
        parseInt(args[0]);

    if (
        isNaN(amount) ||
        amount < 1 ||
        amount > 100
    ) {
        return message.channel.send(
            '❌ Enter a number between 1 and 100.'
        );
    }

    await message.channel.bulkDelete(
        amount,
        true
    );

    const msg =
        await message.channel.send(
            `🗑 Deleted ${amount} messages.`
        );

    setTimeout(
        () => msg.delete().catch(() => {}),
        3000
    );
}

   // =========================
   // BAN
   // =========================

if (command === 'ban') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.BanMembers
        )
    ) {
        return message.channel.send(
            '❌ You need Ban Members permission.'
        );
    }

    const member =
        message.mentions.members.first();

    if (!member) {
        return message.channel.send(
            '❌ Mention a user.'
        );
    }

    const reason =
        args.slice(1).join(' ') ||
        'No reason provided';

    if (member.id === message.author.id) {
        return message.channel.send(
            '❌ You cannot ban yourself.'
        );
    }

    if (
        member.permissions.has(
            PermissionsBitField.Flags.Administrator
        )
    ) {
        return message.channel.send(
            '❌ You cannot ban an administrator.'
        );
    }

    if (
        member.roles.highest.position >=
        message.member.roles.highest.position
    ) {
        return message.channel.send(
            '❌ User has equal or higher role.'
        );
    }

    if (!member.bannable) {
        return message.channel.send(
            '❌ I cannot ban that user.'
        );
    }

    await member.ban({ reason });

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔨 User Banned')
        .addFields(
            {
                name: 'User',
                value: member.user.tag
            },
            {
                name: 'Moderator',
                value: message.author.tag
            },
            {
                name: 'Reason',
                value: reason
            }
        )
        .setTimestamp();

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
    // UNBAN
    // =========================

if (command === 'unban') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.BanMembers
        )
    ) {
        return message.channel.send(
            '❌ You need Ban Members permission.'
        );
    }

    const id = args[0];

    if (!id) {
        return message.channel.send(
            '❌ Provide a user ID.'
        );
    }

    try {

        await message.guild.members.unban(id);

        return message.channel.send(
            `✅ User ${id} unbanned.`
        );

    } catch {

        return message.channel.send(
            '❌ User not found in ban list.'
        );
    }
}
    // =========================
// KICK
// =========================

if (command === 'kick') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.KickMembers
        )
    ) {
        return message.channel.send(
            '❌ You need Kick Members permission.'
        );
    }

    const member =
        message.mentions.members.first();

    if (!member) {
        return message.channel.send(
            '❌ Mention a user.'
        );
    }

    const reason =
        args.slice(1).join(' ') ||
        'No reason provided';

    if (member.id === message.author.id) {
        return message.channel.send(
            '❌ You cannot kick yourself.'
        );
    }

    if (
        member.permissions.has(
            PermissionsBitField.Flags.Administrator
        )
    ) {
        return message.channel.send(
            '❌ You cannot kick an administrator.'
        );
    }

    if (
        member.roles.highest.position >=
        message.member.roles.highest.position
    ) {
        return message.channel.send(
            '❌ User has equal or higher role.'
        );
    }

    if (!member.kickable) {
        return message.channel.send(
            '❌ I cannot kick that user.'
        );
    }

    await member.kick(reason);

    return message.channel.send(
        `👢 ${member.user.tag} kicked.\nReason: ${reason}`
    );
}
    // =========================
// WARN
// =========================

if (command === 'warn') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.ModerateMembers
        )
    ) {
        return message.channel.send(
            '❌ You need Moderate Members permission.'
        );
    }

    const member =
        message.mentions.members.first();

    if (!member) {
        return message.channel.send(
            'Mention a user.'
        );
    }

    const reason =
        args.slice(1).join(' ') ||
        'No reason provided';

    if (!warnings.has(member.id)) {
        warnings.set(member.id, []);
    }

    warnings.get(member.id).push({
        moderator: message.author.tag,
        reason,
        date: Date.now()
    });

    return message.channel.send(
        `⚠️ ${member.user.tag} warned.\nReason: ${reason}`
    );
}
    // =========================
// WARNINGS
// =========================

if (command === 'warnings') {

    const member =
        message.mentions.members.first();

    if (!member) {
        return message.channel.send(
            'Mention a user.'
        );
    }

    const userWarnings =
        warnings.get(member.id) || [];

    if (!userWarnings.length) {
        return message.channel.send(
            'No warnings found.'
        );
    }

    const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle(
            `⚠️ Warnings for ${member.user.tag}`
        )
        .setDescription(
            userWarnings
                .map(
                    (w, i) =>
                        `**${i + 1}.** ${w.reason}\nModerator: ${w.moderator}`
                )
                .join('\n\n')
        );

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
// CLEARWARNS
// =========================

if (command === 'clearwarns') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.ModerateMembers
        )
    ) {
        return message.channel.send(
            '❌ You need Moderate Members permission.'
        );
    }

    const member =
        message.mentions.members.first();

    if (!member) {
        return message.channel.send(
            'Mention a user.'
        );
    }

    warnings.delete(member.id);

    return message.channel.send(
        `✅ Cleared all warnings for ${member.user.tag}`
    );
}
    // =========================
// ROLELIST
// =========================

if (command === 'rolelist') {

    const roles = message.guild.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(role => `${role.name} (${role.members.size})`)
        .join('\n');

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🎭 Server Roles')
        .setDescription(
            roles.length > 4096
                ? roles.slice(0, 4000) + '...'
                : roles
        );

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
// BOTINFO
// =========================

if (command === 'botinfo') {

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🤖 Bot Information')
        .addFields(
            {
                name: 'Bot Name',
                value: client.user.username,
                inline: true
            },
            {
                name: 'Servers',
                value: `${client.guilds.cache.size}`,
                inline: true
            },
            {
                name: 'Users',
                value: `${client.users.cache.size}`,
                inline: true
            },
            {
                name: 'Ping',
                value: `${client.ws.ping}ms`,
                inline: true
            },
            {
                name: 'Node.js',
                value: process.version,
                inline: true
            },
            {
                name: 'Discord.js',
                value: '14.26.4',
                inline: true
            }
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp();

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
// NICKNAME
// =========================

if (
    command === 'nickname' ||
    command === 'nick'
) {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.ManageNicknames
        )
    ) {
        return message.channel.send(
            '❌ You need Manage Nicknames permission.'
        );
    }

    const member =
        message.mentions.members.first();

    if (!member) {
        return message.channel.send(
            `Usage: ${PREFIX}nick @user NewName`
        );
    }

    const nickname =
        args.slice(1).join(' ');

    if (!nickname) {
        return message.channel.send(
            'Provide a nickname.'
        );
    }

    await member.setNickname(
        nickname
    );

    return message.channel.send(
        `✏️ Nickname updated for ${member.user.tag}`
    );
}
    // =========================
// SLOWMODE
// =========================

if (command === 'slowmode') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.ManageChannels
        )
    ) {
        return;
    }

    const seconds =
        parseInt(args[0]);

    if (isNaN(seconds)) {
        return message.channel.send(
            'Provide seconds.'
        );
    }

    await message.channel.setRateLimitPerUser(
        seconds
    );

    return message.channel.send(
        `🐌 Slowmode set to ${seconds}s`
    );
}
    // =========================
// TIMEOUT
// =========================

if (command === 'timeout') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.ModerateMembers
        )
    ) {
        return;
    }

    const member =
        message.mentions.members.first();

    if (!member) {
        return message.channel.send(
            '❌ Mention a user.'
        );
    }

    if (member.id === message.author.id) {
        return message.channel.send(
            '❌ You cannot timeout yourself.'
        );
    }

    const duration =
        parseInt(args[1]) || 1;

    const reason =
        args.slice(2).join(' ') ||
        'No reason provided';

    await member.timeout(
        duration * 60 * 1000,
        reason
    );

    return message.channel.send(
        `⏳ ${member.user.tag} timed out for ${duration} minute(s).\nReason: ${reason}`
    );
}
    // =========================
// UNTIMEOUT
// =========================

if (command === 'untimeout') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.ModerateMembers
        )
    ) {
        return;
    }

    const member =
        message.mentions.members.first();

    if (!member) {
        return message.channel.send(
            '❌ Mention a user.'
        );
    }

    await member.timeout(null);

    return message.channel.send(
        `✅ ${member.user.tag} unmuted.`
    );
}

    // =========================
    // LOCK
    // =========================

    if (command === 'lock') {

      if (
    !message.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
    )
) return;

      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        {
          SendMessages: false
        }
      );

      return message.channel.send(
        '🔒 Channel locked.'
      );
    }

    // =========================
    // UNLOCK
    // =========================

    if (command === 'unlock') {

     if (
    !message.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
    )
) return;

      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        {
          SendMessages: true
        }
      );

      return message.channel.send(
        '🔓 Channel unlocked.'
      );
    }

    // =========================
// ROLE
// =========================

if (command === 'role') {

    if (
        !message.member.permissions.has(
            PermissionsBitField.Flags.ManageRoles
        )
    ) {
        return message.channel.send(
            '❌ You need Manage Roles permission.'
        );
    }

    const member =
        message.mentions.members.first();

    if (!member) {
        return message.channel.send(
            `Usage: ${PREFIX}role @user Role Name`
        );
    }

    const roleName =
        args.slice(1).join(' ');

    const role =
        message.guild.roles.cache.find(
            r =>
                r.name.toLowerCase() ===
                roleName.toLowerCase()
        );

    if (!role) {
        return message.channel.send(
            '❌ Role not found.'
        );
    }

    if (
        role.position >=
        message.member.roles.highest.position
    ) {
        return message.channel.send(
            '❌ You cannot manage that role.'
        );
    }

    if (member.roles.cache.has(role.id)) {

        await member.roles.remove(role);

        return message.channel.send(
    `➖ Removed role "${role.name}" from ${member.user.tag}`
);
    }

    await member.roles.add(role);

    return message.channel.send(
    `➕ Added role "${role.name}" to ${member.user.tag}`
);
}
    
    // =========================
    // ROLEINFO
    // =========================

    if (command === 'roleinfo') {

    const roleName = args.join(' ');

    if (!roleName) {
        return message.channel.send(
            'Usage: ?roleinfo Role Name'
        );
    }

    const role =
        message.guild.roles.cache.find(
            r =>
                r.name.toLowerCase() ===
                roleName.toLowerCase()
        );

    if (!role) {
        return message.channel.send(
            'Role not found.'
        );
    }

    const members =
        role.members.size;

    const embed = new EmbedBuilder()
        .setColor(role.color || '#ff0000')
        .setTitle(`🎭 ${role.name}`)
        .addFields(
            {
                name: '🆔 Role ID',
                value: role.id
            },
            {
                name: '👥 Members',
                value: `${members}`,
                inline: true
            },
            {
                name: '📊 Position',
                value: `${role.position}`,
                inline: true
            },
            {
                name: '📢 Mentionable',
                value: role.mentionable ? 'Yes' : 'No',
                inline: true
            }
        )
        .setTimestamp();

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
// CHANNELINFO
// =========================

if (
    command === 'channelinfo' ||
    command === 'ci'
) {

    const channel =
        message.mentions.channels.first() ||
        message.channel;

    const embed =
        new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(
                '📁 Channel Information'
            )
            .addFields(
                {
                    name: 'Name',
                    value: channel.name,
                    inline: true
                },
                {
                    name: 'ID',
                    value: channel.id,
                    inline: true
                },
                {
                    name: 'Created',
                    value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`
                }
            );

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
    // RULES
    // =========================

    if (command === 'rules') {

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setTitle(
'📌 Krunker Mumbai OFFICIAL RULES'
          )

          .setDescription(`
**Be Respectful**
Treat all members with respect. No racism, sexism, or hate speech.

**No Spamming**
Avoid flooding messages, images, or pings.

**Use Channels Properly**
Keep topics in the correct channels (e.g., use #scrim-schedule for scrim updates).

**Voice Chat Etiquette**
No ear rape, loud music, or mic spam. Respect others in voice.

**Follow Staff Instructions**
Admins and Mods are here to help. Ignoring them can lead to punishment.

**Keep it Safe for All**
No NSFW content, extreme gore, or offensive media.

**Have Fun!**
We're a family. Compete hard, chill harder.
          `)

          .setFooter({
            text: 'Krunker Mumbai'
          })

          .setTimestamp();

      return message.channel.send({
        embeds: [embed]
      });
    }

    // =========================
    // PICKUP RULES
    // =========================

    if (
      command === 'pickuprules'
    ) {

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setTitle(
            '🎯 Pickup Rules'
          )

          .setDescription(`
## Pickup Rules
• Play properly — no trolling, griefing, or throwing
• Do not leave matches midway
• No reporting losses before the match ends
• Only weapon skins are allowed
• Anonymous mode must be OFF
• Stay until final results screen
• Request a sub before leaving
• Don’t misuse bot commands

## Allowed Classes
• Triggerman
• Hunter
• Run N Gun
• Detective
• Marksman
• Commando
• Spray N Pray
• Vince
• Agent
• Trooper

## Restricted (2v2 / 3v3)
• Hunter
• Spray N Pray

## Allowed Secondary Weapons
• Pistol
• Akimbo Pistols
• Auto Pistol
• Desert Eagle
• Techy-9

## Pickups Bot Commands
• ++
• +2v2
• --
• !pick @player
• !rl
• !lb
• !rank

## Penalties
• Class swapping → 10min
• Unfair kicking → 30min
• Dodging → 20min
• Leaving → 20min
• Wrong reports → 30min
          `)

          .setFooter({
            text: 'Krunker Mumbai Pickups'
          })

          .setTimestamp();

      return message.channel.send({
        embeds: [embed]
      });
    }

  }
);

// =========================
// BUTTON INTERACTIONS
// =========================

client.on(
  'interactionCreate',
  async interaction => {

    if (
      !interaction.isButton()
    ) return;

    // =========================
    // ROLES BUTTON
    // =========================

    if (
      interaction.customId ===
      'roles_btn'
    ) {

      const roles =
        interaction.guild.roles.cache
          .sort(
            (a, b) =>
              b.position - a.position
          )
          .map(
            role =>
              role.toString()
          );

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setTitle(
            '🎭 Server Roles'
          )

          .setDescription(
            roles.join(', ')
          );

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    // =========================
    // EMOJIS BUTTON
    // =========================

    if (
      interaction.customId ===
      'emojis_btn'
    ) {

      const emojis =
        interaction.guild.emojis.cache
          .map(
            e => e.toString()
          )
          .join(' ');

      return interaction.reply({
        content:
          emojis || 'No emojis.',
        ephemeral: true
      });
    }

  }
);

// =========================
// LOGIN
// =========================

client.login(
  process.env.TOKEN
);

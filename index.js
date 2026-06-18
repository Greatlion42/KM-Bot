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

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setTitle(
            '📖 KM BOT COMMANDS'
          )

          .setDescription(`
⚙️ Utility
\`${PREFIX}help\`
\`${PREFIX}ping\`
\`${PREFIX}avatar\`
\`${PREFIX}userinfo\`
\`${PREFIX}serverinfo\`
\`${PREFIX}membercount\`

📢 Management
\`${PREFIX}announce\`
\`${PREFIX}say\`
\`${PREFIX}partnerships\`

🛡 Moderation
\`${PREFIX}ban\`
\`${PREFIX}kick\`
\`${PREFIX}timeout\`
\`${PREFIX}untimeout\`
\`${PREFIX}purge\`
\`${PREFIX}lock\`
\`${PREFIX}unlock\`

📜 Server
\`${PREFIX}rules\`
\`${PREFIX}pickuprules\`
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

      if (
        !isOwnerOrAdmin(
          message.member
        )
      ) {
        return message.channel.send(
          'No permission.'
        );
      }

      const raw =
        message.content
          .slice(
            PREFIX.length +
            command.length
          )
          .trim();

      const matches =
        [
          ...raw.matchAll(
            /"([^"]+)"/g
          )
        ].map(
          m => m[1]
        );

      if (matches.length < 4) {

        return message.channel.send(
`Usage:
?announce "message" "channel" "role/everyone" "team name"

Example:
?announce "Queue open now." "#general" "everyone" "Krunker Mumbai Moderation Team"`
        );
      }

      const [
        announcementText,
        channelInput,
        roleInput,
        fromInput
      ] = matches;

      let targetChannel =
        message.mentions.channels.first();

      if (!targetChannel) {

        targetChannel =
          message.guild.channels.cache.find(
            c =>
              c.id === channelInput ||
              c.name ===
              channelInput.replace(
                '#',
                ''
              )
          );
      }

      if (!targetChannel) {

        return message.channel.send(
          'Channel not found.'
        );
      }

      let pingText = '';

      if (
        roleInput.toLowerCase() ===
        'everyone'
      ) {

        pingText = '@everyone';

      } else if (
        roleInput.toLowerCase() ===
        'here'
      ) {

        pingText = '@here';

      } else {

        const role =
          message.guild.roles.cache.find(
            r =>
              r.name.toLowerCase() ===
              roleInput.toLowerCase()
          );

        if (!role) {

          return message.channel.send(
            'Role not found.'
          );
        }

        pingText =
          `<@&${role.id}>`;
      }

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setAuthor({
            name: fromInput,
            iconURL:
              message.guild.iconURL({
                dynamic: true
              })
          })

          .setDescription(
`${announcementText}

- ${fromInput}`
          )

          .setThumbnail(
            message.guild.iconURL({
              dynamic: true,
              size: 1024
            })
          )

          .setFooter({
            text: 'Krunker Mumbai'
          })

          .setTimestamp();

      await targetChannel.send({
        content: `${pingText},`,
        embeds: [embed],
        allowedMentions: {
          parse: [
            'roles',
            'everyone'
          ]
        }
      });

      return message.channel.send(
        `✅ Announcement sent to ${targetChannel}`
      );
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

    if (
      command === 'membercount'
    ) {

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setDescription(
`👥 Members: ${message.guild.memberCount}`
          );

      return message.channel.send({
        embeds: [embed]
      });
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

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setAuthor({
            name:
              member.user.tag,
            iconURL:
              member.user.displayAvatarURL({
                dynamic: true
              })
          })

          .setThumbnail(
            member.user.displayAvatarURL({
              dynamic: true
            })
          )

          .addFields(
            {
              name:
                'Joined Server',
              value:
`<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
            },
            {
              name:
                'Created Account',
              value:
`<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`
            },
            {
              name:
                'Highest Role',
              value:
                `${member.roles.highest}`
            }
          )

          .setFooter({
            text:
              `ID: ${member.user.id}`
          })

          .setTimestamp();

      return message.channel.send({
        embeds: [embed]
      });
    }

    // =========================
    // SERVERINFO
    // =========================

    if (
      command === 'serverinfo'
    ) {

      const guild =
        message.guild;

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setAuthor({
            name:
              guild.name,
            iconURL:
              guild.iconURL({
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
              name:
                '👑 Owner',
              value:
                `<@${guild.ownerId}>`,
              inline: true
            },
            {
              name:
                '👥 Members',
              value:
                `${guild.memberCount}`,
              inline: true
            },
            {
              name:
                '🎭 Roles',
              value:
                `${guild.roles.cache.size}`,
              inline: true
            }
          )

          .setFooter({
            text:
              `ID: ${guild.id}`
          })

          .setTimestamp();

      const row =
        new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setCustomId(
                'roles_btn'
              )
              .setLabel(
                'Roles'
              )
              .setStyle(
                ButtonStyle.Danger
              ),

            new ButtonBuilder()
              .setCustomId(
                'emojis_btn'
              )
              .setLabel(
                'Emojis'
              )
              .setStyle(
                ButtonStyle.Secondary
              )

          );

      return message.channel.send({
        embeds: [embed],
        components: [row]
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

      if (!amount) {

        return message.channel.send(
          'Provide amount.'
        );
      }

      await message.channel.bulkDelete(
        amount,
        true
      );

      return message.channel.send(
        `🗑 Deleted ${amount} messages.`
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
        'You need Ban Members permission.'
    );
}
      return;

      const member =
        message.mentions.members.first();

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
        '❌ You cannot ban another administrator.'
    );
}

if (
    member.roles.highest.position >=
    message.member.roles.highest.position
) {
    return message.channel.send(
        '❌ That user has an equal or higher role.'
    );
}

if (!member.bannable) {
    return message.channel.send(
        '❌ I cannot ban that user.'
    );
}

      if (!member) {

        return message.channel.send(
          'Mention a user.'
        );
      }

      await member.ban();

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setDescription(
`🔨 ${member.user.tag} has been banned.`
          );

      return message.channel.send({
        embeds: [embed]
      });
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
            'Mention a user.'
        );
    }

    // Cannot kick yourself
    if (member.id === message.author.id) {
        return message.channel.send(
            '❌ You cannot kick yourself.'
        );
    }

    // Cannot kick administrators
    if (
        member.permissions.has(
            PermissionsBitField.Flags.Administrator
        )
    ) {
        return message.channel.send(
            '❌ You cannot kick an administrator.'
        );
    }

    // Cannot kick same/higher role
    if (
        member.roles.highest.position >=
        message.member.roles.highest.position
    ) {
        return message.channel.send(
            '❌ That user has an equal or higher role.'
        );
    }

    // Bot hierarchy check
    if (!member.kickable) {
        return message.channel.send(
            '❌ I cannot kick that user.'
        );
    }

    await member.kick();

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription(
            `👢 ${member.user.tag} has been kicked.`
        );

    return message.channel.send({
        embeds: [embed]
    });
}
    // =========================
    // TIMEOUT
    // =========================

    if (command === 'timeout') {

      if (
    !message.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
    )
) return;

      const member =
        message.mentions.members.first();

      const duration =
        parseInt(args[1]) || 1;

      if (!member) {

        return message.channel.send(
          'Mention a user.'
        );
      }

      await member.timeout(
        duration * 60 * 1000
      );

      const embed =
        new EmbedBuilder()

          .setColor('#ff0000')

          .setDescription(
`⏳ ${member.user.tag} timed out for ${duration} minute(s).`
          );

      return message.channel.send({
        embeds: [embed]
      });
    }

    // =========================
    // UNTIMEOUT
    // =========================

    if (
      command === 'untimeout'
    ) {

      if (
    !message.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
    )
) return;

      const member =
        message.mentions.members.first();

      if (!member) {

        return message.channel.send(
          'Mention a user.'
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

    if (!roleName) {
        return message.channel.send(
            'Provide a role name.'
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

    if (
        role.position >=
        message.member.roles.highest.position
    ) {
        return message.channel.send(
            '❌ You cannot manage that role.'
        );
    }

    if (
        member.roles.cache.has(role.id)
    ) {

        await member.roles.remove(role);

        return message.channel.send(
            `➖ Removed ${role} from ${member}`
        );
    }

    await member.roles.add(role);

    return message.channel.send(
        `➕ Added ${role} to ${member}`
    );
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

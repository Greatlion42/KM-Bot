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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
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
// READY
// =========================

client.once('clientReady', () => {

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

client.on('guildMemberAdd', async member => {

  const welcomeChannel =
    member.guild.channels.cache.find(
      c =>
        c.name.includes('welcome') &&
        c.type === ChannelType.GuildText
    );

  if (!welcomeChannel) return;

  const embed = new EmbedBuilder()

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

  welcomeChannel.send({
    embeds: [embed]
  });

});

// =========================
// MESSAGE EVENT
// =========================

client.on('messageCreate', async message => {

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

📢 Announcements
\`${PREFIX}announce\`
\`${PREFIX}say\`

🛡 Moderation
\`${PREFIX}ban\`
\`${PREFIX}kick\`
\`${PREFIX}timeout\`
\`${PREFIX}untimeout\`
\`${PREFIX}purge\`
\`${PREFIX}lock\`
\`${PREFIX}unlock\`

🎫 Server
\`${PREFIX}rules\`
\`${PREFIX}pickuprules\`
\`${PREFIX}partnerships\`
\`${PREFIX}prefix\`
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
  // ANNOUNCE
  // =========================

  if (command === 'announce') {

    if (
      !isOwnerOrAdmin(message.member)
    ) {
      return message.channel.send(
        'No permission.'
      );
    }

    const content =
      message.content.slice(
        PREFIX.length + command.length
      ).trim();

    const matches = [
      ...content.matchAll(
        /"([^"]+)"/g
      )
    ].map(m => m[1]);

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
              channelInput.replace('#', '')
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

      pingText = `<@&${role.id}>`;

    }

    const embed = new EmbedBuilder()

      .setColor('#ff0000')

      .setAuthor({
        name: fromInput,
        iconURL:
          message.guild.iconURL({
            dynamic: true
          })
      })

      .setThumbnail(
        message.guild.iconURL({
          dynamic: true,
          size: 1024
        })
      )

      .setDescription(
`${announcementText}

- ${fromInput}`
      )

      .setFooter({
        text: 'Krunker Mumbai'
      })

      .setTimestamp();

    await targetChannel.send({

      content: `${pingText},`,

      embeds: [embed],

      allowedMentions: {
        parse: ['roles', 'everyone']
      }

    });

    return message.channel.send(
      `✅ Announcement sent to ${targetChannel}`
    );

  }

  // =========================
  // SAY
  // =========================

  if (command === 'say') {

    if (
      !isOwnerOrAdmin(message.member)
    ) return;

    const text = args.join(' ');

    if (!text) return;

    await message.delete().catch(() => {});

    return message.channel.send(text);

  }

  // =========================
  // PREFIX
  // =========================

  if (command === 'prefix') {

    if (
      !isOwnerOrAdmin(message.member)
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

    if (args[0] === 'set') {

      if (!args[1]) {
        return message.channel.send(
          'Provide a new prefix.'
        );
      }

      PREFIX = args[1];

      savePrefix();

      return message.channel.send(
        `✅ Prefix changed to ${PREFIX}`
      );

    }

    if (args[0] === 'reset') {

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

  if (
    command === 'avatar' ||
    command === 'av'
  ) {

    const user =
      message.mentions.users.first() ||
      message.author;

    const avatarURL =
      user.displayAvatarURL({
        dynamic: true,
        size: 1024
      });

    const embed = new EmbedBuilder()

      .setColor('#ff0000')

      .setAuthor({
        name:
          `${user.username}'s Avatar`
      })

      .setImage(avatarURL)

      .setFooter({
        text: `ID: ${user.id}`
      })

      .setTimestamp();

    const row =
      new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel(
              'Open Avatar'
            )
            .setStyle(
              ButtonStyle.Link
            )
            .setURL(avatarURL)
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
`👥 Members: **${message.guild.memberCount}**`
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
            name: 'Joined Server',
            value:
`<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
          },
          {
            name: 'Created Account',
            value:
`<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`
          },
          {
            name: 'Highest Role',
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

    const guild = message.guild;

    const embed =
      new EmbedBuilder()

        .setColor('#ff0000')

        .setAuthor({
          name: guild.name,
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
            name: '👑 Owner',
            value:
              `<@${guild.ownerId}>`,
            inline: true
          },
          {
            name: '👥 Members',
            value:
              `${guild.memberCount}`,
            inline: true
          },
          {
            name: '🎭 Roles',
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
            .setLabel('Roles')
            .setStyle(
              ButtonStyle.Danger
            ),

          new ButtonBuilder()
            .setCustomId(
              'emojis_btn'
            )
            .setLabel('Emojis')
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
      !isOwnerOrAdmin(message.member)
    ) return;

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
      !isOwnerOrAdmin(message.member)
    ) return;

    const member =
      message.mentions.members.first();

    if (!member) return;

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
      !isOwnerOrAdmin(message.member)
    ) return;

    const member =
      message.mentions.members.first();

    if (!member) return;

    await member.kick();

    const embed =
      new EmbedBuilder()

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
      !isModerator(message.member)
    ) return;

    const member =
      message.mentions.members.first();

    if (!member) return;

    const duration =
      parseInt(args[1]) || 1;

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
      !isModerator(message.member)
    ) return;

    const member =
      message.mentions.members.first();

    if (!member) return;

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
      !isModerator(message.member)
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
      !isModerator(message.member)
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
  // RULES
  // =========================

  if (command === 'rules') {

    const embed = new EmbedBuilder()

      .setColor('#ff0000')

      .setTitle(
        '📌 Krunker Mumbai OFFICIAL RULES'
      )

      .setThumbnail(
        message.guild.iconURL({
          dynamic: true
        })
      )

      .setDescription(`
## Be Respectful
Treat all members with respect. No racism, sexism, or hate speech.

## No Spamming
Avoid flooding messages, images, or pings.

## Use Channels Properly
Keep topics in the correct channels (e.g., use #scrim-schedule for scrim updates).

## Voice Chat Etiquette
No ear rape, loud music, or mic spam. Respect others in voice.

## Follow Staff Instructions
Admins and Mods are here to help. Ignoring them can lead to punishment.

## Keep it Safe for All
No NSFW content, extreme gore, or offensive media.

## Have Fun!
We're a family. Compete hard, chill harder.
      `)

      .setFooter({
        text:
          'Krunker Mumbai Rules'
      })

      .setTimestamp();

    return message.channel.send({
      embeds: [embed]
    });

  }

  // =========================
  // PICKUP RULES
  // =========================

  if (command === 'pickuprules') {

    const embed = new EmbedBuilder()

      .setColor('#ff0000')

      .setTitle(
        '🎯 Krunker Mumbai Pickup Rules'
      )

      .setThumbnail(
        message.guild.iconURL({
          dynamic: true
        })
      )

      .setDescription(`
## Pickup Rules
• Play properly — no trolling, griefing, or throwing (includes excessive TDM play)
• Do not leave matches midway
• No reporting losses before the match ends
• Only weapon skins are allowed (no other cosmetics)
• Anonymous mode must be OFF (if verified)
• Stay until the final results screen
• If you need to leave, request a sub first
• Don’t misuse bot commands during matches

## Allowed Classes
• Triggerman (AR)
• Hunter (Sniper)
• Run N Gun (SMG)
• Detective (Revolver)
• Marksman (Semi-Auto)
• Commando (FAMAS)
• Spray N Pray (LMG)
• Vince (Shotgun)
• Agent (Akimbo Uzi)
• Trooper (Blaster)

## Restricted (2v2 / 3v3)
• Hunter (Sniper)
• Spray N Pray (LMG)

## Allowed Secondary Weapons
• Pistol
• Akimbo Pistols
• Auto Pistol
• Desert Eagle
• Techy-9

## Pickups Bot Commands
• \`++\` → Join every queue at the same time
• \`+2v2\` → Join a certain queue
• \`--\` → Leave every queue at the same time
• \`!pick @player\` → Captain picks players
• \`!rl\` → Report match loss
• \`!lb\` → View leaderboard
• \`!rank\` → Check your rank

## Penalties
• Class swapping mid-game → 10min
• Unfair kicking/banning → 30min
• Dodging games → 20min
• Leaving games → 20min
• Wrong game reports → 30min

> Punishments may vary depending on the situation.
      `)

      .setFooter({
        text:
          'Krunker Mumbai Pickups'
      })

      .setTimestamp();

    return message.channel.send({
      embeds: [embed]
    });

  }



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

client.login(process.env.TOKEN);

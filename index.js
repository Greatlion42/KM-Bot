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
    role => role.name === roleName
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

  const channel =
    member.guild.channels.cache.find(
      c =>
        c.name.includes('welcome') &&
        c.type === ChannelType.GuildText
    );

  if (!channel) return;

  const embed = new EmbedBuilder()

    .setColor('#ff0000')

    .setTitle('🎉 Welcome to Krunker Mumbai')

    .setDescription(
`Welcome ${member}

Read the rules and enjoy your stay.`
    )

    .setThumbnail(
      member.user.displayAvatarURL({
        dynamic: true
      })
    )

    .setImage(
      member.guild.bannerURL({
        size: 1024
      })
    )

    .setFooter({
      text: `Member #${member.guild.memberCount}`
    })

    .setTimestamp();

  channel.send({
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
  // AUTO ANNOUNCEMENT EMBED
  // =========================

  if (
    message.channel.name ===
    '📢・𝙎𝙚𝙧𝙫𝙚𝙧_𝘼𝙣𝙣𝙤𝙪𝙣𝙘𝙚𝙢𝙚𝙣𝙩𝙨'
  ) {

    const embed = new EmbedBuilder()

      .setColor('#ff0000')

      .setAuthor({
        name: message.author.tag,
        iconURL:
          message.author.displayAvatarURL({
            dynamic: true
          })
      })

      .setDescription(message.content)

      .setThumbnail(
        message.guild.iconURL({
          dynamic: true
        })
      )

      .setFooter({
        text: 'Krunker Mumbai Announcements'
      })

      .setTimestamp();

    return message.channel.send({
      embeds: [embed]
    });
  }

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

      .setTitle('📖 KM BOT COMMANDS')

      .setDescription(`
⚙️ Utility
\`${PREFIX}help\`
\`${PREFIX}ping\`
\`${PREFIX}avatar\`
\`${PREFIX}userinfo\`
\`${PREFIX}serverinfo\`
\`${PREFIX}membercount\`

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
\`${PREFIX}say\`
      `)

      .setFooter({
        text: 'Krunker Mumbai'
      });

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

    if (!isOwnerOrAdmin(message.member)) {
      return;
    }

    const text = args.join(' ');

    if (!text) return;

    await message.delete().catch(() => {});

    return message.channel.send(text);
  }

  // =========================
  // PARTNERSHIPS
  // =========================

  if (command === 'partnerships') {

    const banner =
      new EmbedBuilder()

        .setColor('#000000')

        .setImage(
'https://cdn.discordapp.com/attachments/1384997597084647559/1507304224608751616/ChatGPT_Image_May_22_2026_02_18_32_PM.png?ex=6a1169f3&is=6a101873&hm=b928e4475ef2a5f178a6db58081b99d209c27f6d3eb7457714264ee580b6aa71&'
        );

    const main =
      new EmbedBuilder()

        .setColor('#ff0000')

        .setTitle('🤝 KM Partnerships')

        .setDescription(`
## Official Servers

Competitive Krunker Apac [CKA](https://discord.gg/)
Krunker Pro Circuit [KPC](https://discord.gg/)
Tiranga [TRNG](https://discord.gg/)

## Clans

8t Clan [8t](https://discord.gg/)
No Lifes/Nl [NL](https://discord.gg/)

## Featured

🔻 Water Client Support
🔻 Mumbai Competitive Hub
        `)

        .setFooter({
          text: 'Krunker Mumbai Partnerships'
        });

    return message.channel.send({
      embeds: [banner, main]
    });
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

    const avatar =
      user.displayAvatarURL({
        dynamic: true,
        size: 1024
      });

    const embed =
      new EmbedBuilder()

        .setColor('#ff0000')

        .setAuthor({
          name: `${user.tag}`
        })

        .setImage(avatar)

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
          name: member.user.tag,
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
        });

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
    ) {
      return;
    }

    const amount =
      parseInt(args[0]);

    if (!amount) return;

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

    const duration =
      parseInt(args[1]) || 1;

    if (!member) return;

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

    const embed =
      new EmbedBuilder()

        .setColor('#ff0000')

        .setTitle(
          '📜 Server Rules'
        )

        .setDescription(`
• Respect everyone
• No racism or toxicity
• No NSFW
• No spam
• Listen to staff
• Use channels properly
        `);

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
• No trolling
• No leaving matches
• Stay till scoreboard
• Respect teammates

Restricted:
Hunter
Spray N Pray
        `);

    return message.channel.send({
      embeds: [embed]
    });
  }

});

// =========================
// BUTTONS
// =========================

client.on(
  'interactionCreate',
  async interaction => {

    if (!interaction.isButton())
      return;

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
          .map(role =>
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
          .map(e =>
            e.toString()
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

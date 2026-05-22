require('dotenv').config();

const fs = require('fs');

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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

let PREFIX = '?';

// PREFIX SAVE
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

// ROLE CHECKS
function hasRole(member, roleName) {
  return member.roles.cache.some(
    role => role.name === roleName
  );
}

function isOwnerOrAdmin(member) {
  return (
    hasRole(member, 'Owner') ||
    hasRole(member, 'Admin')
  );
}

function isModerator(member) {
  return hasRole(member, 'Moderator');
}

// READY
client.once('clientReady', () => {
  console.log(`${client.user.tag} is online!`);
});

// MESSAGE COMMANDS
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;
  if (!message.guild) return;

  // AUTO PARTNERS CHANNEL EMBED
  if (
    message.channel.name === '📢・𝙋𝙖𝙧𝙩𝙣𝙚𝙧𝙨𝙝𝙞𝙥𝙨'
  ) {

    if (message.embeds.length > 0) return;

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🤝 Partnership')
      .setDescription(message.content)
      .setFooter({
        text: `Posted by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({
          dynamic: true
        })
      })
      .setTimestamp();

    await message.delete().catch(() => {});

    return message.channel.send({
      embeds: [embed]
    });
  }

  // AUTO ANNOUNCEMENT EMBED
  if (
    message.channel.name === '📢・𝙎𝙚𝙧𝙫𝙚𝙧_𝘼𝙣𝙣𝙤𝙪𝙣𝙘𝙚𝙢𝙚𝙣𝙩𝙨'
  ) {

    if (message.embeds.length > 0) return;

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('📢 Server Announcement')
      .setDescription(message.content)
      .setFooter({
        text: `Announcement by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({
          dynamic: true
        })
      })
      .setTimestamp();

    await message.delete().catch(() => {});

    return message.channel.send({
      embeds: [embed]
    });
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content
    .slice(PREFIX.length)
    .trim()
    .split(/ +/);

  const command = args.shift()?.toLowerCase();

  // PREFIX
  if (command === 'prefix') {

    if (!args[0]) {
      return message.channel.send(
        `Current Prefix: ${PREFIX}`
      );
    }

    if (!isOwnerOrAdmin(message.member)) {
      return message.channel.send('No permission.');
    }

    if (args[0] === 'set') {

      if (!args[1]) {
        return message.channel.send(
          'Provide a prefix.'
        );
      }

      PREFIX = args[1];

      savePrefix();

      return message.channel.send(
        `Prefix changed to ${PREFIX}`
      );
    }

    if (args[0] === 'reset') {

      PREFIX = '?';

      savePrefix();

      return message.channel.send(
        'Prefix reset.'
      );
    }
  }

  // AVATAR
  if (command === 'av') {

    const user =
      message.mentions.users.first() ||
      message.author;

    const avatarURL = user.displayAvatarURL({
      dynamic: true,
      size: 1024
    });

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setImage(avatarURL)
      .setFooter({
        text: `${user.username}'s Avatar`
      })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Open in Browser')
          .setStyle(ButtonStyle.Link)
          .setURL(avatarURL)
      );

    return message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }

  // MEMBERCOUNT
  if (command === 'membercount') {

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setDescription(
        `👥 Members: **${message.guild.memberCount}**`
      );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // ROLE COMMAND
  if (command === 'role') {

    if (!isOwnerOrAdmin(message.member)) {
      return message.channel.send('No permission.');
    }

    const member =
      message.mentions.members.first();

    if (!member) {
      return message.channel.send(
        'Mention a user.'
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
        'Role not found.'
      );
    }

    if (member.roles.cache.has(role.id)) {

      await member.roles.remove(role);

      return message.channel.send(
        `Removed ${role.name} from ${member.user.username}`
      );

    } else {

      await member.roles.add(role);

      return message.channel.send(
        `Added ${role.name} to ${member.user.username}`
      );
    }
  }

  // PURGE
  if (command === 'purge') {

    if (!isOwnerOrAdmin(message.member)) {
      return message.channel.send('No permission.');
    }

    const amount = parseInt(args[0]);

    if (!amount) {
      return message.channel.send(
        'Enter amount.'
      );
    }

    await message.channel.bulkDelete(
      amount,
      true
    );

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setDescription(
        `🗑 Deleted **${amount}** messages.`
      );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // BAN
  if (command === 'ban') {

    if (!isOwnerOrAdmin(message.member)) {
      return message.channel.send('No permission.');
    }

    const member =
      message.mentions.members.first();

    if (!member) {
      return message.channel.send(
        'Mention a user.'
      );
    }

    await member.ban();

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setAuthor({
        name: 'KM Moderation',
        iconURL:
          client.user.displayAvatarURL()
      })
      .setThumbnail(
        member.user.displayAvatarURL({
          dynamic: true
        })
      )
      .setDescription(
        `🔨 ${member.user.tag} has been banned.`
      )
      .addFields({
        name: 'Moderator',
        value: `${message.author.tag}`,
        inline: true
      })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { users: [] }
    });
  }

  // UNBAN
  if (command === 'unban') {

    if (!isOwnerOrAdmin(message.member)) {
      return message.channel.send('No permission.');
    }

    if (!args[0]) {
      return message.channel.send(
        'Provide user ID.'
      );
    }

    await message.guild.members.unban(args[0]);

    const embed = new EmbedBuilder()
      .setColor('#00ff99')
      .setDescription(
        `✅ User unbanned successfully.`
      );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // KICK
  if (command === 'kick') {

    if (!isOwnerOrAdmin(message.member)) {
      return message.channel.send('No permission.');
    }

    const member =
      message.mentions.members.first();

    if (!member) {
      return message.channel.send(
        'Mention a user.'
      );
    }

    await member.kick();

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setAuthor({
        name: 'KM Moderation',
        iconURL:
          client.user.displayAvatarURL()
      })
      .setThumbnail(
        member.user.displayAvatarURL({
          dynamic: true
        })
      )
      .setDescription(
        `👢 ${member.user.tag} has been kicked.`
      )
      .addFields({
        name: 'Moderator',
        value: `${message.author.tag}`,
        inline: true
      })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { users: [] }
    });
  }

  // TIMEOUT
  if (command === 'timeout') {

    if (
      !isOwnerOrAdmin(message.member) &&
      !isModerator(message.member)
    ) {
      return message.channel.send('No permission.');
    }

    const member =
      message.mentions.members.first();

    if (!member) {
      return message.channel.send(
        'Mention a user.'
      );
    }

    const duration =
      parseInt(args[1]) || 1;

    await member.timeout(
      duration * 60 * 1000
    );

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setAuthor({
        name: 'KM Moderation',
        iconURL:
          client.user.displayAvatarURL()
      })
      .setThumbnail(
        member.user.displayAvatarURL({
          dynamic: true
        })
      )
      .setDescription(
        `🔇 ${member.user.tag} has been timed out for ${duration} minute(s).`
      )
      .addFields(
        {
          name: 'Moderator',
          value: `${message.author.tag}`,
          inline: true
        },
        {
          name: 'Duration',
          value: `${duration} minute(s)`,
          inline: true
        }
      )
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { users: [] }
    });
  }

  // UNTIMEOUT
  if (command === 'untimeout') {

    if (
      !isOwnerOrAdmin(message.member) &&
      !isModerator(message.member)
    ) {
      return message.channel.send('No permission.');
    }

    const member =
      message.mentions.members.first();

    if (!member) {
      return message.channel.send(
        'Mention a user.'
      );
    }

    await member.timeout(null);

    const embed = new EmbedBuilder()
      .setColor('#00ff99')
      .setAuthor({
        name: 'KM Moderation',
        iconURL:
          client.user.displayAvatarURL()
      })
      .setThumbnail(
        member.user.displayAvatarURL({
          dynamic: true
        })
      )
      .setDescription(
        `🔊 ${member.user.tag} has been unmuted.`
      )
      .addFields({
        name: 'Moderator',
        value: `${message.author.tag}`,
        inline: true
      })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { users: [] }
    });
  }

  // RULES
  if (command === 'rules') {

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('📌 Krunker Mumbai OFFICIAL RULES')
      .setDescription(`
**Be Respectful**
Treat all members with respect. No racism, sexism, or hate speech.

**No Spamming**
Avoid flooding messages, images, or pings.

**Use Channels Properly**
Keep topics in the correct channels.

**Voice Chat Etiquette**
No ear rape, loud music, or mic spam.

**Follow Staff Instructions**
Ignoring staff can lead to punishment.

**Keep it Safe**
No NSFW content or gore.

**Have Fun!**
Compete hard, chill harder.
`);

    return message.channel.send({
      embeds: [embed]
    });
  }

  // PICKUP RULES
  if (command === 'pickuprules') {

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🎯 Pickup Rules')
      .setDescription(`
Play properly — no trolling, griefing, or throwing (includes excessive TDM play)

Do not leave matches midway

No reporting losses before the match ends

Only weapon skins are allowed

Anonymous mode must be OFF (if verified)

Stay until the final results screen

If you need to leave, request a sub first

Don’t misuse bot commands during matches

**Allowed Classes**
Triggerman (AR)
Hunter (Sniper)
Run N Gun (SMG)
Detective (Revolver)
Marksman (Semi-Auto)
Commando (FAMAS)
Spray N Pray (LMG)
Vince (Shotgun)
Agent (Akimbo Uzi)
Trooper (Blaster)

**Restricted (2v2 / 3v3)**
Hunter (Sniper)
Spray N Pray (LMG)

**Allowed Secondary Weapons**
Pistol
Akimbo Pistols
Auto Pistol
Desert Eagle
Techy-9

**Penalties**
Class swapping → 10min
Dodging → 20min
Leaving → 20min
Wrong reports → 30min
`);

    return message.channel.send({
      embeds: [embed]
    });
  }

  // USERINFO
  if (command === 'userinfo' || command === 'ui') {

    const member =
      message.mentions.members.first() ||
      message.member;

    const user = member.user;

    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .sort((a, b) => b.position - a.position);

    let roleText = '';

    if (roles.size > 15) {
      roleText = 'Too many roles to show.';
    } else if (roles.size === 0) {
      roleText = 'None';
    } else {
      roleText = roles
        .map(role => role.toString())
        .join(', ');
    }

    const permissions = [];

    if (member.permissions.has('Administrator'))
      permissions.push('Administrator');

    if (member.permissions.has('ManageGuild'))
      permissions.push('Manage Server');

    if (member.permissions.has('ManageRoles'))
      permissions.push('Manage Roles');

    if (member.permissions.has('ManageChannels'))
      permissions.push('Manage Channels');

    if (member.permissions.has('ManageMessages'))
      permissions.push('Manage Messages');

    if (member.permissions.has('ManageWebhooks'))
      permissions.push('Manage Webhooks');

    if (member.permissions.has('ManageNicknames'))
      permissions.push('Manage Nicknames');

    if (member.permissions.has('ManageGuildExpressions'))
      permissions.push('Manage Emojis and Stickers');

    if (member.permissions.has('KickMembers'))
      permissions.push('Kick Members');

    if (member.permissions.has('BanMembers'))
      permissions.push('Ban Members');

    if (member.permissions.has('MentionEveryone'))
      permissions.push('Mention Everyone');

    if (member.permissions.has('ModerateMembers'))
      permissions.push('Timeout Members');

    const acknowledgements = [];

    if (member.id === message.guild.ownerId) {
      acknowledgements.push('Server Owner');
    }

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({
          dynamic: true
        })
      })
      .setThumbnail(
        user.displayAvatarURL({
          dynamic: true
        })
      )
      .setDescription(`${user}`)
      .addFields(
        {
          name: 'Joined',
          value:
            `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
        },
        {
          name: 'Registered',
          value:
            `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`
        },
        {
          name: `Roles [${roles.size}]`,
          value: roleText
        },
        {
          name: 'Key Permissions',
          value:
            permissions.length > 0
              ? permissions.join(', ')
              : 'None'
        },
        {
          name: 'Acknowledgements',
          value:
            acknowledgements.length > 0
              ? acknowledgements.join(', ')
              : 'None'
        }
      )
      .setImage(
        user.displayAvatarURL({
          dynamic: true,
          size: 1024
        })
      )
      .setFooter({
        text: `ID: ${user.id}`
      });

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { users: [] }
    });
  }

  // SERVERINFO
  if (command === 'serverinfo') {

    const guild = message.guild;

    const textChannels = guild.channels.cache.filter(
      c => c.type === ChannelType.GuildText
    ).size;

    const voiceChannels = guild.channels.cache.filter(
      c => c.type === ChannelType.GuildVoice
    ).size;

    const categories = guild.channels.cache.filter(
      c => c.type === ChannelType.GuildCategory
    ).size;

    const bots = guild.members.cache.filter(
      m => m.user.bot
    ).size;

    const humans =
      guild.memberCount - bots;

    const onlineMembers = guild.members.cache.filter(
      m => m.presence?.status !== 'offline'
    ).size;

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL({ dynamic: true })
      })
      .setThumbnail(
        guild.iconURL({
          dynamic: true,
          size: 1024
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
          value: `<t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
          inline: true
        },
        {
          name: '👥 Members',
          value:
            `Total: ${guild.memberCount}\n` +
            `Humans: ${humans}\n` +
            `Bots: ${bots}\n` +
            `Online: ${onlineMembers}`,
          inline: true
        },
        {
          name: '📚 Channels',
          value:
            `Categories: ${categories}\n` +
            `Text: ${textChannels}\n` +
            `Voice: ${voiceChannels}`,
          inline: true
        },
        {
          name: '😀 Emojis',
          value: `${guild.emojis.cache.size}`,
          inline: true
        }
      )
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({
          dynamic: true
        })
      })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('roles_btn')
          .setLabel(`Roles (${guild.roles.cache.size})`)
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId('emojis_btn')
          .setLabel(`Emojis (${guild.emojis.cache.size})`)
          .setStyle(ButtonStyle.Secondary)
      );

    return message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }

});

// BUTTONS
client.on(
  'interactionCreate',
  async interaction => {

    if (!interaction.isButton()) return;

    // ROLES BUTTON
    if (interaction.customId === 'roles_btn') {

      const roles =
        interaction.guild.roles.cache
          .sort((a, b) => b.position - a.position)
          .map(role => role.toString());

      const chunks = [];

      while (roles.length) {
        chunks.push(
          roles.splice(0, 50).join('\n')
        );
      }

      for (const chunk of chunks) {

        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle(
            `Roles [${interaction.guild.roles.cache.size}]`
          )
          .setDescription(chunk);

        await interaction.channel.send({
          embeds: [embed]
        });
      }

      return interaction.reply({
        content: 'Sent roles list.',
        ephemeral: true
      });
    }

    // EMOJIS BUTTON
    if (interaction.customId === 'emojis_btn') {

      const emojis =
        interaction.guild.emojis.cache
          .map(emoji => emoji.toString());

      const chunks = [];

      while (emojis.length) {
        chunks.push(
          emojis.splice(0, 50).join(' ')
        );
      }

      for (const chunk of chunks) {
        await interaction.channel.send(chunk);
      }

      return interaction.reply({
        content: 'Sent emojis list.',
        ephemeral: true
      });
    }

  }
);

client.login(process.env.TOKEN);

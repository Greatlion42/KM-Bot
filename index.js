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

// USERINFO
if (command === 'userinfo') {

  const member =
    message.mentions.members.first() ||
    message.member;

  const roles = member.roles.cache
    .filter(role => role.name !== '@everyone')
    .sort((a, b) => b.position - a.position);

  let roleText = roles.map(role => role.toString()).join(', ');

  if (roleText.length > 1000) {
    roleText = 'Too many roles to show.';
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

  if (member.permissions.has('ManageEmojisAndStickers'))
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
      name: member.user.tag,
      iconURL: member.user.displayAvatarURL({
        dynamic: true
      })
    })

    .setThumbnail(
      member.user.displayAvatarURL({
        dynamic: true,
        size: 1024
      })
    )

    .addFields(

      {
        name: 'Joined',
        value:
`<t:${parseInt(member.joinedTimestamp / 1000)}:F>`,
        inline: false
      },

      {
        name: 'Registered',
        value:
`<t:${parseInt(member.user.createdTimestamp / 1000)}:F>`,
        inline: false
      },

      {
        name: `Roles [${roles.size}]`,
        value: roleText || 'None',
        inline: false
      },

      {
        name: 'Key Permissions',
        value:
          permissions.join(', ') || 'None',
        inline: false
      },

      {
        name: 'Acknowledgements',
        value:
          acknowledgements.join(', ') || 'None',
        inline: false
      }

    )

    .setImage(
      member.user.displayAvatarURL({
        dynamic: true,
        size: 1024
      })
    )

    .setFooter({
      text:
`ID: ${member.user.id} • Today at ${new Date().toLocaleTimeString()}`
    })

    .setTimestamp();

  return message.channel.send({
    embeds: [embed],
    allowedMentions: {
      users: []
    }
  });

}

// MESSAGE COMMANDS
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;
  if (!message.guild) return;

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
      return message.channel.send(
        'No permission.'
      );
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
      .setAuthor({
        name: `${user.username}'s Avatar`,
        iconURL: avatarURL
      })
      .setImage(avatarURL)
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
      return message.channel.send(
        'No permission.'
      );
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
      return message.channel.send(
        'No permission.'
      );
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
      return message.channel.send(
        'No permission.'
      );
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
      .setDescription(
        `🔨 **${member.user.tag}** has been banned.`
      )
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: {
        users: []
      }
    });
  }

  // UNBAN
  if (command === 'unban') {

    if (!isOwnerOrAdmin(message.member)) {
      return message.channel.send(
        'No permission.'
      );
    }

    if (!args[0]) {
      return message.channel.send(
        'Provide user ID.'
      );
    }

    await message.guild.members.unban(
      args[0]
    );

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
      return message.channel.send(
        'No permission.'
      );
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
      .setDescription(
        `👢 **${member.user.tag}** has been kicked.`
      );

    return message.channel.send({
      embeds: [embed],
      allowedMentions: {
        users: []
      }
    });
  }

  // TIMEOUT
  if (command === 'timeout') {

    if (
      !isOwnerOrAdmin(message.member) &&
      !isModerator(message.member)
    ) {
      return message.channel.send(
        'No permission.'
      );
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

      .setDescription(
`✅ **${member.user.tag}** has been timed out for **${duration} minute(s)**.`
      )

      .addFields(
        {
          name: '👮 Moderator',
          value: `${message.author.tag}`,
          inline: true
        },
        {
          name: '⏱ Duration',
          value: `${duration} minute(s)`,
          inline: true
        }
      )

      .setThumbnail(
        member.user.displayAvatarURL({
          dynamic: true
        })
      )

      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: {
        users: []
      }
    });
  }

  // UNTIMEOUT
  if (command === 'untimeout') {

    if (
      !isOwnerOrAdmin(message.member) &&
      !isModerator(message.member)
    ) {
      return message.channel.send(
        'No permission.'
      );
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

      .setDescription(
`✅ **${member.user.tag}** has been unmuted.`
      )

      .addFields({
        name: '👮 Moderator',
        value: `${message.author.tag}`,
        inline: true
      })

      .setThumbnail(
        member.user.displayAvatarURL({
          dynamic: true
        })
      )

      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: {
        users: []
      }
    });
  }

  // RULES
  if (command === 'rules') {

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(
        '📌 Krunker Mumbai OFFICIAL RULES'
      )
      .setDescription(
`**Be Respectful**
Treat all members with respect.

**No Spamming**
Avoid flooding messages.

**Use Channels Properly**
Use channels correctly.

**Voice Chat Etiquette**
No mic spam or loud music.

**Follow Staff Instructions**
Listen to staff.

**Keep it Safe**
No NSFW or gore.

**Have Fun!**
Compete hard, chill harder.`
      );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // PICKUP RULES
  if (command === 'pickuprules') {

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(
        '🎯 Pickup Rules'
      )
      .setDescription(
`Play properly — no trolling or throwing
Do not leave matches midway
No fake reports
Only weapon skins allowed
Stay until final results screen

**Allowed Classes**
Triggerman
Hunter
Run N Gun
Detective
Marksman
Commando
Spray N Pray
Vince
Agent
Trooper

**Restricted**
Hunter
Spray N Pray

**Penalties**
Dodging → 20min
Leaving → 20min
Wrong reports → 30min`
      );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // ROLES
  if (command === 'roles') {

    const roles =
      message.guild.roles.cache
        .sort(
          (a, b) =>
            b.position - a.position
        )
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
          `Roles [${message.guild.roles.cache.size}]`
        )
        .setDescription(chunk);

      await message.channel.send({
        embeds: [embed]
      });
    }
  }

  // SERVERINFO
  if (command === 'serverinfo') {

    const guild = message.guild;

    const textChannels =
      guild.channels.cache.filter(
        c =>
          c.type ===
          ChannelType.GuildText
      ).size;

    const voiceChannels =
      guild.channels.cache.filter(
        c =>
          c.type ===
          ChannelType.GuildVoice
      ).size;

    const categories =
      guild.channels.cache.filter(
        c =>
          c.type ===
          ChannelType.GuildCategory
      ).size;

    const embed = new EmbedBuilder()

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
          name: '👥 Members',
          value: `${guild.memberCount}`,
          inline: true
        },

        {
          name: '🎭 Roles',
          value: `${guild.roles.cache.size}`,
          inline: true
        },

        {
          name: '📂 Categories',
          value: `${categories}`,
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
              `Roles`
            )
            .setStyle(
              ButtonStyle.Danger
            ),

          new ButtonBuilder()
            .setCustomId(
              'emojis_btn'
            )
            .setLabel(
              `Emojis`
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

});

// BUTTONS
client.on(
  'interactionCreate',
  async interaction => {

    if (!interaction.isButton()) return;

    // ROLES BUTTON
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
            role => role.toString()
          );

      const chunks = [];

      while (roles.length) {
        chunks.push(
          roles.splice(
            0,
            50
          ).join('\n')
        );
      }

      for (const chunk of chunks) {

        const embed =
          new EmbedBuilder()
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
        content:
          'Sent roles list.',
        ephemeral: true
      });
    }

    // EMOJIS BUTTON
    if (
      interaction.customId ===
      'emojis_btn'
    ) {

      const emojis =
        interaction.guild.emojis.cache
          .map(
            emoji =>
              emoji.toString()
          );

      const chunks = [];

      while (emojis.length) {
        chunks.push(
          emojis.splice(
            0,
            50
          ).join(' ')
        );
      }

      for (const chunk of chunks) {
        await interaction.channel.send(
          chunk
        );
      }

      return interaction.reply({
        content:
          'Sent emojis list.',
        ephemeral: true
      });
    }
  }
);

client.login(process.env.TOKEN);

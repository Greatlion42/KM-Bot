require('dotenv').config();

const fs = require('fs');

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
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

// PREFIX SYSTEM
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
  return hasRole(
    member,
    'Moderator'
  );
}

// READY
client.once(
  'clientReady',
  () => {
    console.log(
      `${client.user.tag} is online!`
    );
  }
);

// COMMANDS
client.on(
  'messageCreate',
  async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    if (
      !message.content.startsWith(
        PREFIX
      )
    ) return;

    const args =
      message.content
        .slice(
          PREFIX.length
        )
        .trim()
        .split(/ +/);

    const command =
      args.shift()
        ?.toLowerCase();

    // PREFIX
    if (command === 'prefix') {

      if (!args[0]) {
        return message.channel.send(
          `Current Prefix: ${PREFIX}`
        );
      }

      if (
        !isOwnerOrAdmin(
          message.member
        )
      ) {
        return message.channel.send(
          'No permission.'
        );
      }

      if (
        args[0] === 'set'
      ) {

        PREFIX = args[1];

        savePrefix();

        return message.channel.send(
          `Prefix changed to ${PREFIX}`
        );

      }

      if (
        args[0] === 'reset'
      ) {

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

      const avatarURL =
        user.displayAvatarURL({
          size: 1024,
          dynamic: true
        });

      const embed =
        new EmbedBuilder()
          .setColor('#ff0000')
          .setAuthor({
            name:
`${user.username}'s Avatar`,
            iconURL: avatarURL
          })
          .setImage(avatarURL);

      const row =
        new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setLabel(
                'Open in Browser'
              )
              .setStyle(
                ButtonStyle.Link
              )
              .setURL(
                avatarURL
              )

          );

      return message.channel.send({
        embeds: [embed],
        components: [row]
      });

    }

    // MEMBERCOUNT
    if (
      command === 'membercount'
    ) {

      return message.channel.send(
        `Members: ${message.guild.memberCount}`
      );

    }

    // ROLE TOGGLE
    if (
      command === 'role'
    ) {

      if (
        !isOwnerOrAdmin(
          message.member
        )
      ) {
        return message.channel.send(
          'No permission.'
        );
      }

      const member =
        message.mentions.members.first();

      if (!member) {
        return message.channel.send(
          'Use: ?role @user Role Name'
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

      if (
        member.roles.cache.has(
          role.id
        )
      ) {

        await member.roles.remove(
          role
        );

        return message.channel.send(
          `Removed ${role.name} from ${member.user.username}`
        );

      } else {

        await member.roles.add(
          role
        );

        return message.channel.send(
          `Added ${role.name} to ${member.user.username}`
        );

      }

    }

    // PURGE
    if (
      command === 'purge'
    ) {

      if (
        !isOwnerOrAdmin(
          message.member
        )
      ) {
        return message.channel.send(
          'No permission.'
        );
      }

      const amount =
        parseInt(args[0]);

      if (!amount) {
        return message.channel.send(
          'Enter amount.'
        );
      }

      await message.channel.bulkDelete(
        amount,
        true
      );

      return message.channel.send(
        `Deleted ${amount} messages.`
      );

    }

    // BAN
    if (command === 'ban') {

      if (
        !isOwnerOrAdmin(
          message.member
        )
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

      await member.ban();

      return message.channel.send(
        `${member.user.tag} banned.`
      );

    }

    // UNBAN
    if (
      command === 'unban'
    ) {

      if (
        !isOwnerOrAdmin(
          message.member
        )
      ) {
        return message.channel.send(
          'No permission.'
        );
      }

      await message.guild.members.unban(
        args[0]
      );

      return message.channel.send(
        'User unbanned.'
      );

    }

    // KICK
    if (command === 'kick') {

      if (
        !isOwnerOrAdmin(
          message.member
        )
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

      await member.kick();

      return message.channel.send(
        `${member.user.tag} kicked.`
      );

    }

    // TIMEOUT
    if (
      command === 'timeout'
    ) {

      if (
        !isOwnerOrAdmin(
          message.member
        ) &&
        !isModerator(
          message.member
        )
      ) {
        return message.channel.send(
          'No permission.'
        );
      }

      const member =
        message.mentions.members.first();

      await member.timeout(
        10 * 60 * 1000
      );

      return message.channel.send(
        `${member.user.tag} timed out.`
      );

    }

    // UNTIMEOUT
    if (
      command === 'untimeout'
    ) {

      if (
        !isOwnerOrAdmin(
          message.member
        ) &&
        !isModerator(
          message.member
        )
      ) {
        return message.channel.send(
          'No permission.'
        );
      }

      const member =
        message.mentions.members.first();

      await member.timeout(null);

      return message.channel.send(
        `${member.user.tag} unmuted.`
      );

    }

    // RULES
    if (
      command === 'rules'
    ) {

      const embed =
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle(
            '📌 Krunker Mumbai • OFFICIAL RULES'
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
    if (
      command === 'pickuprules'
    ) {

      const embed =
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle(
            '🎯 Krunker Mumbai • Pickup Rules'
          )
          .setDescription(
`**Pickup Rules**
Play properly — no trolling or throwing
Do not leave matches midway
No fake reports
Only weapon skins allowed
Stay until final screen

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
    if (
      command === 'roles'
    ) {

      const roles =
        message.guild.roles.cache
          .sort(
            (a, b) =>
              b.position -
              a.position
          )
          .map(
            role =>
              role.toString()
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
`Roles [${message.guild.roles.cache.size}]`
            )
            .setDescription(chunk);

        await message.channel.send({
          embeds: [embed]
        });

      }

    }

    // SERVERINFO
    if (
      command === 'serverinfo'
    ) {

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

      const bots =
        guild.members.cache.filter(
          m => m.user.bot
        ).size;

      const humans =
        guild.memberCount - bots;

      const onlineMembers =
        guild.members.cache.filter(
          m =>
            m.presence?.status !==
            'offline'
        ).size;

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
              dynamic: true,
              size: 1024
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
              name: '🆔 Server ID',
              value: guild.id,
              inline: true
            },

            {
              name: '📅 Created',
              value:
                `<t:${parseInt(
                  guild.createdTimestamp / 1000
                )}:R>`,
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
              name: '💎 Boosts',
              value:
                `Level: ${guild.premiumTier}\n` +
                `Boosts: ${guild.premiumSubscriptionCount || 0}`,
              inline: true
            },

            {
              name: '📚 Channels',
              value:
                `Categories: ${categories}\n` +
                `Text: ${textChannels}\n` +
                `Voice: ${voiceChannels}`,
              inline: true
            }

          )

          .setFooter({
            text:
`Requested by ${message.author.username}`,
            iconURL:
              message.author.displayAvatarURL({
                dynamic: true
              })
          })

          .setTimestamp();

      if (
        guild.bannerURL()
      ) {

        embed.setImage(
          guild.bannerURL({
            size: 1024
          })
        );

      }

      const row =
        new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setCustomId(
                'roles_btn'
              )
              .setLabel(
`Roles (${guild.roles.cache.size})`
              )
              .setStyle(
                ButtonStyle.Danger
              ),

            new ButtonBuilder()
              .setCustomId(
                'emojis_btn'
              )
              .setLabel(
`Emojis (${guild.emojis.cache.size})`
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

  }
);

// BUTTONS
client.on(
  'interactionCreate',
  async (
    interaction
  ) => {

    if (
      !interaction.isButton()
    ) return;

    // ROLES BUTTON
    if (
      interaction.customId ===
      'roles_btn'
    ) {

      const roles =
        interaction.guild.roles.cache
          .sort(
            (a, b) =>
              b.position -
              a.position
          )
          .map(
            role =>
              role.toString()
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

client.login(
  process.env.TOKEN
); 

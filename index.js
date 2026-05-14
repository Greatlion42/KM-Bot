require('dotenv').config();

const fs = require('fs');

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Prefix
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

// Permissions
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

// Online
client.once(
  'clientReady',
  () => {
    console.log(
      `${client.user.tag} is online!`
    );
  }
);

// Commands
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

    // Prefix
    if (
      command === 'prefix'
    ) {

      if (!args[0]) {
        return message.channel.send(
          `Current prefix: ${PREFIX}`
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

        PREFIX =
          args[1];

        savePrefix();

        return message.channel.send(
          `Prefix changed to ${PREFIX}`
        );

      }

      if (
        args[0] === 'reset'
      ) {

        PREFIX =
          '?';

        savePrefix();

        return message.channel.send(
          'Prefix reset.'
        );

      }

    }

    // Avatar
    if (
      command === 'av'
    ) {

      const user =
        message.mentions.users.first() ||
        message.author;

      const avatarURL =
        user.displayAvatarURL({
          size: 1024
        });

      const embed =
        new EmbedBuilder()
          .setColor(
            '#ff0000'
          )
          .setAuthor({
            name:
`${user.username}'s Avatar`,
            iconURL:
              avatarURL
          })
          .setImage(
            avatarURL
          );

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

    // Member count
    if (
      command === 'membercount'
    ) {

      return message.channel.send(
        `Members: ${message.guild.memberCount}`
      );

    }

    // Role toggle
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

    // Purge
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
        parseInt(
          args[0]
        );

      await message.channel.bulkDelete(
        amount,
        true
      );

      return message.channel.send(
        `Deleted ${amount} messages.`
      );

    }

    // Kick
    if (
      command === 'kick'
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

      await member.kick();

      return message.channel.send(
        `${member.user.tag} kicked.`
      );

    }

    // Ban
    if (
      command === 'ban'
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

      await member.ban();

      return message.channel.send(
        `${member.user.tag} banned.`
      );

    }

    // Unban
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

    // Timeout
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
        10 *
        60 *
        1000
      );

      return message.channel.send(
        `${member.user.tag} timed out.`
      );

    }

    // Untimeout
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

      await member.timeout(
        null
      );

      return message.channel.send(
        `${member.user.tag} timeout removed.`
      );

    }

    // Roles
    if (
      command === 'roles'
    ) {

      const roles =
        message.guild.roles.cache
          .sort(
            (
              a,
              b
            ) =>
              b.position -
              a.position
          )
          .map(
            role =>
              role.toString()
          )
          .join('\n');

      const embed =
        new EmbedBuilder()
          .setColor(
            '#ff0000'
          )
          .setTitle(
`Roles [${message.guild.roles.cache.size}]`
          )
          .setDescription(
            roles.slice(
              0,
              4000
            )
          );

      return message.channel.send({
        embeds: [embed]
      });

    }

    // Rules
    if (
      command === 'rules'
    ) {

      const embed =
        new EmbedBuilder()
          .setColor(
            '#ff0000'
          )
          .setTitle(
'📌 Krunker Mumbai • OFFICIAL RULES'
          )
          .setDescription(
`**Be Respectful**
Treat all members with respect. No racism, sexism, or hate speech.

**No Spamming**
Avoid flooding messages, images, or pings.

**Use Channels Properly**
Keep topics in correct channels.

**Voice Chat Etiquette**
No mic spam, loud music, or disruptive behavior.

**Follow Staff Instructions**
Admins and Mods are here to help.

**Keep it Safe for All**
No NSFW, gore, or offensive content.

**Have Fun!**
We're a family. Compete hard, chill harder.`
          );

      return message.channel.send({
        embeds: [embed]
      });

    }

    // Pickup Rules
    if (
      command === 'pickuprules'
    ) {

      const embed =
        new EmbedBuilder()
          .setColor(
            '#ff0000'
          )
          .setTitle(
'🎯 Krunker Mumbai • Pickup Rules'
          )
          .setDescription(
`**Pickup Rules**
Play properly — no trolling, griefing, or throwing
Do not leave matches midway
No reporting losses before the match ends
Only weapon skins are allowed
Anonymous mode must be OFF
Stay until final results screen
Request a sub before leaving

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

**Restricted (2v2 / 3v3)**
Hunter
Spray N Pray

**Penalties**
Class swapping → 10min
Unfair kicking → 30min
Dodging → 20min
Leaving → 20min`
          );

      return message.channel.send({
        embeds: [embed]
      });

    }

    // Server info
    if (
      command === 'serverinfo'
    ) {

      const owner =
        await message.guild.fetchOwner();

      const embed =
        new EmbedBuilder()
          .setColor(
            '#ff0000'
          )
          .setTitle(
            message.guild.name
          )
          .setThumbnail(
            message.guild.iconURL()
          )
          .setDescription(
`**Owner**
${owner.user.username}

**Members**
${message.guild.memberCount}

**Roles**
${message.guild.roles.cache.size}`
          );

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

  }
);

// Buttons
client.on(
  'interactionCreate',
  async (
    interaction
  ) => {

    if (
      !interaction.isButton()
    ) return;

    if (
      interaction.customId ===
      'roles_btn'
    ) {

      const roles =
        interaction.guild.roles.cache
          .sort(
            (
              a,
              b
            ) =>
              b.position -
              a.position
          )
          .map(
            role =>
              role.toString()
          )
          .join('\n');

      const embed =
        new EmbedBuilder()
          .setColor(
            '#ff0000'
          )
          .setTitle(
`Roles [${interaction.guild.roles.cache.size}]`
          )
          .setDescription(
            roles.slice(
              0,
              4000
            )
          );

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

    }

    if (
      interaction.customId ===
      'emojis_btn'
    ) {

      const emojis =
        interaction.guild.emojis.cache
          .map(
            emoji =>
              emoji.toString()
          )
          .join(' ');

      return interaction.reply({
        content:
          emojis ||
          'No emojis found.',
        ephemeral: true
      });

    }

  }
);

client.login(
  process.env.TOKEN
);
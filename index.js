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

// Prefix storage
let PREFIX = '?';

if (fs.existsSync('./prefix.json')) {
  const data = JSON.parse(
    fs.readFileSync('./prefix.json')
  );

  PREFIX = data.prefix;
}

function savePrefix() {
  fs.writeFileSync(
    './prefix.json',
    JSON.stringify({
      prefix: PREFIX
    })
  );
}

// Role checks
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

    // Prefix check
    if (
      command === 'prefix'
    ) {

      if (
        !args[0]
      ) {
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

      const action =
        args[0];

      if (
        action === 'set'
      ) {

        if (
          !args[1]
        ) {
          return message.channel.send(
            'Example: ?prefix set !'
          );
        }

        PREFIX =
          args[1];

        savePrefix();

        return message.channel.send(
          `Prefix changed to ${PREFIX}`
        );

      }

      if (
        action === 'reset'
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
if (command === 'av') {

  const user =
    message.mentions.users.first() ||
    message.author;

  const avatarURL =
    user.displayAvatarURL({
      size: 1024
    });

   const embed =
  new EmbedBuilder()
    .setColor('#ff0000')
    .setAuthor({
      name: `${user.username}'s Avatar`,
      iconURL: avatarURL
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

      if (
        !amount
      ) {
        return message.channel.send(
          'Example: ?purge 20'
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

      if (
        !member
      ) {
        return message.channel.send(
          'Mention a user.'
        );
      }

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

      if (
        !member
      ) {
        return message.channel.send(
          'Mention a user.'
        );
      }

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

      const userId =
        args[0];

      if (
        !userId
      ) {
        return message.channel.send(
          'Example: ?unban USER_ID'
        );
      }

      await message.guild.members.unban(
        userId
      );

      return message.channel.send(
        `User unbanned.`
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

      if (
        !member
      ) {
        return message.channel.send(
          'Mention a user.'
        );
      }

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

      if (
        !member
      ) {
        return message.channel.send(
          'Mention a user.'
        );
      }

      await member.timeout(
        null
      );

      return message.channel.send(
        `${member.user.tag} timeout removed.`
      );

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

    // Rules
   if (command === 'rules') {

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('📌 Krunker Mumbai • OFFICIAL RULES')
    .setThumbnail(message.guild.iconURL())
    .setDescription(
`**Be Respectful**
Treat all members with respect. No racism, sexism, or hate speech.

**No Spamming**
Avoid flooding messages, images, or pings.

**Use Channels Properly**
Keep topics in the correct channels (example: #scrim-schedule).

**Voice Chat Etiquette**
No loud music, mic spam, or disruptive behavior. Respect others in voice.

**Follow Staff Instructions**
Admins and Moderators are here to help. Ignoring them can lead to punishment.

**Keep it Safe for All**
No NSFW content, extreme gore, or offensive media.

**Have Fun!**
We're a family. Compete hard, chill harder.`
    );

  return message.channel.send({
    embeds: [embed]
  });

}

    // Pickup rules
if (command === 'pickuprules') {

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('🎯 Krunker Mumbai • Pickup Rules')
    .setThumbnail(message.guild.iconURL())
    .setDescription(
`**Pickup Rules**
Play properly — no trolling, griefing, or throwing (includes excessive TDM play)
Do not leave matches midway
No reporting losses before the match ends
Only weapon skins are allowed (no other cosmetics)
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

**Pickups Bot Commands**
++ → Join every queue
+2v2 → Join a queue
-- → Leave every queue
!pick @player → Captain picks players
!rl → Report match loss
!lb → View leaderboard
!rank → Check your rank

**Penalties**
Class swapping mid-game → 10min
Unfair kicking/banning → 30min
Dodging games → 20min
Leaving games → 20min
Wrong game reports → 30min

*Note: punishments may vary depending on the situation.*`
    );

  return message.channel.send({
    embeds: [embed]
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
          .join(
            ' '
          );

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
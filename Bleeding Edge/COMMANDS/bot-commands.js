const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { triviaQuestions } = require('../TRIVIA/questions'); // Import trivia questions
const { VERSION } = require('../UPDATER/version'); // Import the version

// Helper function to calculate the next level's required messages
function getNextLevelMessages(level) {
  return 20 * (level + 1); // Each level multiplies by 20 messages
}

const cooldowns = new Map();

// Command handlers
const commandHandlers = {
  trivia: async (message) => {
    const triviaChannelId = process.env.TRIVIA_CHANNEL_ID;

    // Check if the command is executed in the correct channel
    if (message.channel.id !== triviaChannelId) {
      return message.reply(`This command can only be used in the designated trivia channel.`);
    }

    const userId = message.author.id;

    // Implement cooldown
    const cooldown = 30 * 1000; // 30 seconds
    const lastUsed = cooldowns.get(userId);

    if (lastUsed && Date.now() - lastUsed < cooldown) {
      return message.reply(
        `Please wait ${(cooldown - (Date.now() - lastUsed)) / 1000}s before using this command again.`
      );
    }
    cooldowns.set(userId, Date.now());

    // Select a random trivia question
    const trivia = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];

    const buttons = trivia.options.map((option, index) =>
      new ButtonBuilder()
        .setCustomId(`trivia_${index}_${userId}`) // Include user ID to restrict to command initiator
        .setLabel(option)
        .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Trivia Time!")
      .setDescription(trivia.question);

    const triviaMessage = await message.channel.send({
      embeds: [embed],
      components: [row],
    });

    const filter = (interaction) =>
      interaction.customId.startsWith('trivia_') &&
      interaction.customId.endsWith(userId) &&
      interaction.user.id === message.author.id;

    const collector = triviaMessage.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    collector.on('collect', async (interaction) => {
      const selectedOptionIndex = parseInt(
        interaction.customId.split('_')[1]
      );
      const correct = selectedOptionIndex === trivia.correctIndex;

      buttons.forEach((button) => button.setDisabled(true));
      const updatedRow = new ActionRowBuilder().addComponents(buttons);

      await interaction.update({
        embeds: [
          embed.setFooter({
            text: correct ? `${message.author.username}, Correct!` : "Incorrect!",
          }),
        ],
        components: [updatedRow],
      });

      collector.stop();
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        buttons.forEach((button) => button.setDisabled(true));
        const updatedRow = new ActionRowBuilder().addComponents(buttons);

        triviaMessage.edit({
          embeds: [embed.setFooter({ text: "Time's up!" })],
          components: [updatedRow],
        });
      }
    });
  },

  ping: async (message) => {
    message.channel.send('Pong!');
  },

  greet: async (message) => {
    message.channel.send(`Hello, ${message.author.username}!`);
  },

  help: async (message) => {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Available Commands')
      .setDescription('Here are the commands you can use:')
      .addFields(
        { name: '?trivia', value: 'Play a trivia game!' },
        { name: '?ping', value: 'Check bot responsiveness.' },
        { name: '?greet', value: 'Get a friendly greeting.' },
        { name: '?help', value: 'See this list of commands.' },
        { name: '?level', value: 'Check your current level and XP.' },
        { name: '?version', value: 'Show the current release version of the bot.' }
      );

    message.channel.send({ embeds: [embed] });
  },

  level: async (message, args, levelDb) => {
    const userId = message.author.id;
    const serverId = message.guild.id;

    levelDb.get(
      `SELECT level, messages FROM levels WHERE user_id = ? AND server_id = ?`,
      [userId, serverId],
      (err, row) => {
        if (err) {
          console.error("Error fetching user level data:", err.message);
          return message.reply("An error occurred while fetching your level data.");
        }

        if (!row) {
          return message.reply("You have not started earning XP yet. Start chatting to gain levels!");
        }

        const { level, messages } = row;
        const nextLevelMessages = getNextLevelMessages(level);
        const messagesToNextLevel = nextLevelMessages - messages;

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle(`${message.author.username}'s Level`)
          .setDescription(`You are currently at level ${level}.`)
          .addFields(
            { name: 'XP', value: `${messages} / ${nextLevelMessages}`, inline: true },
            { name: 'Messages to Next Level', value: `${messagesToNextLevel}`, inline: true }
          );

        message.channel.send({ embeds: [embed] });
      }
    );
  },

  version: async (message) => {
    message.channel.send(`The current release version of the bot is **${VERSION}**.`);
  },

  setlevel: async (message, args, levelDb) => {
    if (!adminUsers.includes(message.author.id)) {
      return message.reply("You do not have permission to use this command.");
    }

    const [username, newLevel] = args;
    if (!username || isNaN(newLevel)) {
      return message.reply("Usage: ?setlevel <username> <new_level>");
    }

    // Find the user by username
    const user = message.guild.members.cache.find(
      (member) => member.user.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return message.reply(`User with username "${username}" not found.`);
    }

    const userId = user.id;

    levelDb.run(
      `UPDATE levels SET level = ? WHERE user_id = ? AND server_id = ?`,
      [parseInt(newLevel), userId, message.guild.id],
      (err) => {
        if (err) {
          console.error("Error updating user level:", err.message);
          return message.reply("An error occurred while updating the level.");
        }
        message.reply(`User ${username}'s level has been set to ${newLevel}.`);
      }
    );
  },
  allgenshin: async (message) => {
    message.channel.send('Available Genshin Commands:\n- checkforcodes\n- latestcode\n- redeem\n- setchannel\n- setrole');
  },

  checkforcodes: async (message) => {
    const codes = await scrapeWebsite();
    if (codes.length > 0) {
      message.channel.send(`New codes found:\n${codes.join('\n')}`);
    } else {
      message.channel.send('No new codes found.');
    }
  },

  latestcode: async (message) => {
    // Logic to fetch and display the latest valid codes
    const latestCodes = ["code1", "code2"]; // Replace with actual logic
    message.channel.send(`Latest valid codes:\n${latestCodes.join('\n')}`);
  },

  redeem: async (message) => {
    // Logic to provide redemption links
    const validCodes = ["code1", "code2"]; // Replace with actual logic
    const links = validCodes.map(code => `https://genshin.hoyoverse.com/en/gift?code=${code}`);
    message.channel.send(`Redeem links:\n${links.join('\n')}`);
  },

  setchannel: async (message) => {
    // Logic to set channel for announcements
    const channel = message.channel;
    message.channel.send(`Genshin code announcements will now be sent to this channel.`);
  },

  setrole: async (message, args) => {
    // Logic to set role for notifications
    if (args.length > 0) {
      const role = message.guild.roles.cache.find(r => r.name === args.join(' '));
      if (role) {
        message.channel.send(`Set to notify role: ${role.name}`);
      } else {
        message.channel.send('Role not found.');
      }
    } else {
      message.channel.send('Please specify a role.');
    }
  },
};


// Load commands function
function loadCommands(client, levelDb) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase().slice(1); // Remove the prefix (e.g., '?')

    if (commandHandlers[command]) {
      try {
        await commandHandlers[command](message, args, levelDb);
      } catch (error) {
        console.error(`Error executing command ${command}:`, error);
        message.reply('An error occurred while executing that command.');
      }
    }
  });
}

module.exports = { loadCommands };
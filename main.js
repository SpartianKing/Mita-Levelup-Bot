const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const SQLite = require('sqlite3').verbose();
const { loadCommands } = require('./COMMANDS/bot-commands');
const { updateUserLevel } = require('./FUNCTIONS/functions');

// Load .env variables
dotenv.config();

// Parse admin users from environment variables
const adminUsers = JSON.parse(process.env.ADMIN_USERS);

// Initialize bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// SQLite for per-server level management
const levelDb = new SQLite.Database('./levels.db', (err) => {
  if (err) console.error("Error opening SQLite database:", err.message);
});

// Create levels table if not exists
levelDb.run(`
  CREATE TABLE IF NOT EXISTS levels (
    server_id TEXT,
    user_id TEXT,
    level INTEGER,
    messages INTEGER,
    rank TEXT
  )
`);

// Load commands
loadCommands(client, levelDb);

// Event: Bot is ready
client.once('ready', () => {
  console.log('Bot is online!');
});

//creates the messages

client.on('messageCreate', (message) => {
  if (message.author.bot) return; // Ignore bot messages

  const serverId = message.guild.id;
  const userId = message.author.id;

  updateUserLevel(levelDb, serverId, userId, client);
});



// Log in to Discord via the TOKEN defined in the .env
client.login(process.env.DISCORD_TOKEN);
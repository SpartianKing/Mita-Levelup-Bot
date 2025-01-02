const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const SQLite = require('sqlite3').verbose();
const { loadCommands } = require('./COMMANDS/bot-commands');
const { updateUserLevel } = require('./FUNCTIONS/functions');
const { execSync } = require('child_process');
const { checkForUpdates } = require('./UPDATER/update'); // Import the update function

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

// Check if AUTOUPDATE is enabled
if (process.env.AUTOUPDATE === 'true') {
  try {
    // Check if simple-git is installed
    require.resolve('simple-git');
  } catch (e) {
    console.log('simple-git not found, installing...');
    execSync('npm install simple-git', { stdio: 'inherit' });
  }

  // Run the update check
  checkForUpdates();
}

// Load commands
loadCommands(client, levelDb);

// Event: Bot is ready
client.once('ready', () => {
  console.log('Bot is online!');
});

// Event: Message Create
client.on('messageCreate', (message) => {
  if (message.author.bot) return; // Ignore bot messages

  const serverId = message.guild.id;
  const userId = message.author.id;

  updateUserLevel(levelDb, serverId, userId, client);
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
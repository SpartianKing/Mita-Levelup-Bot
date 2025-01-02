const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const axios = require('axios');
const cheerio = require('cheerio');
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
// Utility to scrape website
async function scrapeWebsite() {
  try {
    const response = await axios.get(process.env.WEBSITE);
    const $ = cheerio.load(response.data);

    // Example: Fetch codes from a specific element
    const codes = [];
    $('selector-for-codes').each((index, element) => {
      const code = $(element).text().trim();
      if (code) {
        codes.push(code);
      }
    });
    return codes;
  } catch (error) {
    console.error('Error scraping website', error);
    return [];
  }
}

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

// Event: Message Create
client.on('messageCreate', (message) => {
  if (message.author.bot) return; // Ignore bot messages

  const serverId = message.guild.id;
  const userId = message.author.id;

  updateUserLevel(levelDb, serverId, userId, client);
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
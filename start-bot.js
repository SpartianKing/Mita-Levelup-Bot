const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { checkForUpdates } = require('./UPDATER/update'); // Import the update function

async function startBot() {
  try {
    // Check for updates
    await checkForUpdates();

    // Define the path to main.js
    const mainPath = path.resolve(__dirname, 'main.js');

    // Check if main.js exists
    if (!fs.existsSync(mainPath)) {
      throw new Error(`main.js not found at path: ${mainPath}`);
    }

    // Start the bot
    console.log('Starting the bot...');
    execSync(`node "${mainPath}"`, { stdio: 'inherit' }); // Use quotes to handle spaces in paths
  } catch (error) {
    console.error('Error starting the bot:', error);
  }
}

startBot();
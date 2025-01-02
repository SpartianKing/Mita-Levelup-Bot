const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const { VERSION } = require('./version'); // Import the version

async function checkForUpdates() {
  const fetch = (await import('node-fetch')).default; // Dynamically import node-fetch
  const REPO_OWNER = 'SpartianKing';
  const REPO_NAME = 'Mita-Levelup-Bot';
  const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/tags`;

  try {
    const response = await fetch(API_URL);
    const tags = await response.json();

    if (!Array.isArray(tags) || tags.length === 0) {
      console.log('No tags found in the repository.');
      return;
    }

    // Find the latest tag that is newer than the current version
    const latestTag = tags.find(tag => isVersionNewer(VERSION, tag.name));

    if (!latestTag) {
      console.log('You are already using the latest version.');
      return;
    }

    const downloadUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/archive/refs/tags/${latestTag.name}.zip`;

    console.log(`Current version: ${VERSION}`);
    console.log(`Latest version: ${latestTag.name}`);

    console.log('New version available. Downloading...');
    const zipPath = path.resolve(__dirname, 'latest.zip');
    const res = await fetch(downloadUrl);
    const fileStream = fs.createWriteStream(zipPath);
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on('error', reject);
      fileStream.on('finish', resolve);
    });

    console.log('Download complete. Extracting...');
    const extractDir = path.resolve(__dirname, '..');
    if (os.platform() === 'win32') {
      // Use extract-zip for Windows
      const extract = require('extract-zip');
      await extract(zipPath, { dir: extractDir });
    } else {
      // Use unzip command for Linux
      execSync(`unzip -o ${zipPath} -d ${extractDir}`);
    }
    fs.unlinkSync(zipPath); // Remove the zip file after extraction

    // Exclude start-bot.js from being overwritten
    const startBotPath = path.resolve(__dirname, 'start-bot.js');
    if (fs.existsSync(startBotPath)) {
      fs.copyFileSync(startBotPath, path.join(extractDir, 'start-bot.js'));
    }

    console.log('Update complete. Please restart the bot to apply changes.');
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

function parseVersion(version) {
  return version ? version.match(/\d+/g).map(Number) : [];
}

function isVersionNewer(currentVersion, latestVersion) {
  const current = parseVersion(currentVersion);
  const latest = parseVersion(latestVersion);

  for (let i = 0; i < Math.max(current.length, latest.length); i++) {
    const currentPart = current[i] || 0;
    const latestPart = latest[i] || 0;
    if (currentPart < latestPart) return true;
    if (currentPart > latestPart) return false;
  }
  return false;
}

module.exports = { checkForUpdates };
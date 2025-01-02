const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { VERSION } = require('./version'); // Import the version

async function checkForUpdates() {
  const REPO_OWNER = 'SpartianKing';
  const REPO_NAME = 'Mita-Levelup-Bot';
  const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const latestTag = data.tag_name;
    const downloadUrl = data.zipball_url;

    console.log(`Current version: ${VERSION}`);
    console.log(`Latest version: ${latestTag}`);

    if (isVersionNewer(VERSION, latestTag)) {
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
      execSync(`unzip -o ${zipPath} -d ${path.resolve(__dirname, '..')}`);
      fs.unlinkSync(zipPath); // Remove the zip file after extraction
      console.log('Update complete. Please restart the bot to apply changes.');
    } else {
      console.log('You are already using the latest version.');
    }
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
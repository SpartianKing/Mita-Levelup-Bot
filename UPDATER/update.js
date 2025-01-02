const simpleGit = require('simple-git');
const path = require('path');
const { VERSION } = require('./version'); // Import the version

function parseVersion(version) {
  // Extract numeric parts from the version string and convert them to numbers
  return version.match(/\d+/g).map(Number);
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

async function checkForUpdates() {
  const REPO_URL = 'https://github.com/SpartianKing/Mita-Levelup-Bot.git'; // GitHub repository URL
  const LOCAL_REPO_PATH = path.resolve(__dirname, '..'); // Assuming the script is in the UPDATER directory

  const git = simpleGit(LOCAL_REPO_PATH);

  try {
    // Fetch the latest changes from the remote repository
    await git.fetch();

    // Get the latest tag from the remote
    const tags = await git.tags();
    const latestTag = tags.latest;

    console.log(`Current version: ${VERSION}`);
    console.log(`Latest version: ${latestTag}`);

    if (isVersionNewer(VERSION, latestTag)) {
      console.log('New version available. Updating...');
      await git.pull('origin', 'main'); // Pull the latest changes from the main branch
      console.log('Update complete. Please restart the bot to apply changes.');
    } else {
      console.log('You are already using the latest version.');
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

module.exports = { checkForUpdates };
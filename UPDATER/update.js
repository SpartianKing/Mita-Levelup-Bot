const simpleGit = require('simple-git');
const path = require('path');

async function checkForUpdates() {
  const VERSION = JSON.parse(process.env.VERSION)[0];
  const REPO_URL = 'https://github.com/SpartianKing/Mita-Levelup-Bot.git';
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

    if (VERSION !== latestTag) {
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
# Mita-Levelup-Bot


This code is owned by Dreamcraft Network

<a href="https://youtube.com/@dreamcraftnetwork">Dreamcraft Network On Youtube</a> |
<a href="https://dreamcraftnetwork.com">Dreamcraft Network Website</a> | <a href="mailto:adrian@dreamcraftnetwork.com">adrian@dreamcraftnetwork.com</a>



This guide will walk you through the setup and configuration of the DreamCraft Network Leveling Bot. Follow these steps carefully to get the bot running.

## Dependencies Installation

First, you need to install the required dependencies. Copy and paste the following command into your terminal:

```bash
npm install discord.js dotenv sqlite3 simple-git node-fetch
```

Note: This command must be run in the terminal and cannot be executed through the file.

### Environment Configuration
Copy the Example Environment File
Once the dependencies are installed, locate the Copy_Example.env file and copy it to .env. This will be used to store your bot's configuration settings.

### Set Your Discord Bot Token
Open the .env file and set your Discord Bot Token:
```bash
DISCORD_TOKEN=Your_Discord_Bot_Token
```

You can obtain the Discord Bot Token by creating a bot on the <a href="https://discord.com/developers/applications">Discord Developer Portal</a>, under the "Bot" section.

# Define Admin Users
In the .env file, define the users who will have admin permissions. Right-click your username in Discord and copy the ID. Then, paste the ID into the ADMIN_USERS array:
```bash
ADMIN_USERS=["Your_Discord_User_ID","Another_Discord_User_ID"]
```
If you only have one admin user, simply delete any extra entries (the "" values).

```bash
ADMIN_USERS=["Your_Discord_User_ID"]
```

### Set Channel IDs
Define the channels where commands will be executed and where the level-up messages will be sent. Copy the channel IDs from Discord and paste them into the appropriate fields:

```bash
LEVEL_UP_CHANNEL_ID=Your_Level_Up_Channel_ID
TRIVIA_CHANNEL_ID=Your_Trivia_Channel_ID
```

# Running the Bot
## On Windows
Open your terminal and navigate to the directory containing main.js.

Run the following command to start the bot:
```bash
node main.js
```
## On Linux
Open your terminal and navigate to the directory containing main.js.

To run the bot in a new session, use the following command:
```bash
screen -dmS dreamcraftnetworklevelingbot node main.js
```
To access the bot's session later, use:
```bash
screen -r dreamcraftnetworklevelingbot
```




# Updating Bot

Once there is a new release available, 
# Conclusion
Once you've followed all the steps, your bot should be up and running! You can now manage it through Discord by using the admin permissions and sending commands in the specified channels.

For any further issues, feel free to reach out for assistance. 
<a href="mailto:adrian@dreamcraftnetwork.com">adrian@DreamcraftNetwork.com</a>

Enjoy your bot!
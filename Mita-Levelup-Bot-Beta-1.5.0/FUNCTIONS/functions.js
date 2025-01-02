const updateUserLevel = (levelDb, serverId, userId, client) => {
  levelDb.get(
    `SELECT * FROM levels WHERE server_id = ? AND user_id = ?`,
    [serverId, userId],
    (err, row) => {
      if (err) {
        console.error("Error fetching user level data:", err.message);
        return;
      }

      if (!row) {
        // If no record exists, create a new one
        levelDb.run(
          `INSERT INTO levels (server_id, user_id, level, messages, rank) VALUES (?, ?, ?, ?, ?)`,
          [serverId, userId, 0, 1, ''],
          (err) => {
            if (err) console.error("Error inserting new user level data:", err.message);
          }
        );
      } else {
        // Update existing record
        let { level, messages } = row;
        messages += 1;

        // Calculate the required messages for the next level
        const requiredMessages = 20 * (level + 1);

        if (messages >= requiredMessages) {
          level += 1;
          messages = 0; // Reset message count after leveling up

          // Log level up to console
          console.log(`User ${userId} leveled up to level ${level}!`);

          // Send level up message to the specified channel
          const levelUpChannelId = process.env.LEVEL_UP_CHANNEL_ID;
          const levelUpChannel = client.channels.cache.get(levelUpChannelId);

          if (levelUpChannel) {
            levelUpChannel.send(`<@${userId}> has leveled up to level ${level}!`);
          } else {
            console.error("Level up channel not found or bot lacks permissions.");
          }
        }

        levelDb.run(
          `UPDATE levels SET level = ?, messages = ? WHERE server_id = ? AND user_id = ?`,
          [level, messages, serverId, userId],
          (err) => {
            if (err) console.error("Error updating user level data:", err.message);
          }
        );
      }
    }
  );
};

module.exports = { updateUserLevel };
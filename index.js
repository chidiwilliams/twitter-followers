const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function run(usernames) {
  try {
    for (let i = 0; i < usernames.length; i++) {
      let nextCursor = -1;
      let totalFollowerCount = 0;
      while (nextCursor) {
        const username = usernames[i];
        const token = process.env.TWITTER_TOKEN;

        const req = await axios.get(
          `https://api.twitter.com/1.1/followers/list.json?cursor=${nextCursor}&screen_name=${username}&skip_status=true&include_user_entities=false&count=200`,
          { headers: { authorization: `Bearer ${token}` } }
        );

        const { users } = req.data;

        totalFollowerCount += users.length;
        const fileNo = parseInt(totalFollowerCount / 100000);

        fs.existsSync(`./export`) || fs.mkdirSync(`./export`);
        fs.existsSync(`./export/${username}`) ||
          fs.mkdirSync(`./export/${username}`);

        const fileName = `./export/${username}/${fileNo}.csv`;
        const stream = fs.createWriteStream(fileName, { flags: 'a' });
        stream.write(
          users.map(({ id, screen_name }) => `${id},${screen_name}`).join('\n')
        );
        stream.end();
        nextCursor = req.data.next_cursor;
      }
      console.log(`written ${totalFollowerCount} users`);
    }
  } catch (error) {
    console.error(error.response.data);
  }
}

run(process.env.USER);

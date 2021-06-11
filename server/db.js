const { Pool } = require('pg');
const assert = require('assert');


const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://obzffxmxtmqays:4f61631aba26df3eab668b9fc0af82eba9dbd692623b966fc3a36943af4c4a5d@ec2-54-234-28-165.compute-1.amazonaws.com:5432/d9jdhmiae2ofcb',
    ssl: {
      rejectUnauthorized: false,
    }
});

const constructQuery = (client, sql) => {
  return client.query(sql);
};

const parseMessages = (res) => {
  if (res.rowCount === 0) {
      return [];
  }
 assert(res);
  return res.rows.map((row) => {
      return {
          message: row.message,
          source: row.source
      };
  });
};

const fetchMessages = () => {
  const selectMessages = `
      SELECT message, source
      FROM rabbit_queue
  `;
  
  // Prevent SQL injection using parametrized queries
  return pool.connect()
      .then((client) => {
        
          return constructQuery(client, selectMessages)
              .then((res) => {
                  client.release();

                  return parseMessages(res);
              })
              .catch((err) => {
                  client.release();
                  // eslint-disable-next-line no-console
                  console.error(err.stack);
              });
      });
};

const insertMessage = (message) => {

  console.log(message);

  var msg = JSON.parse(message);

  console.log(msg.source);
  console.log(msg.message);

  const insertMsg = `Insert into rabbit_queue values ('${msg.message}', '${msg.source}')`;

return pool.connect()
      .then((client) => {
        client.query(insertMsg).then((res) => {
          client.release();
			
				});
      });
};

module.exports = {
  fetchMessages,
  insertMessage
};
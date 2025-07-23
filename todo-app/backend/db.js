const mysql = require('mysql2');
const retry = require('async-retry');

const connectWithRetry = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'securepassword',
    database: process.env.DB_NAME || 'todo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return retry(
    async () => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.error(' MySQL connection failed:', err.message);
            return reject(err);
          }
          console.log(' MySQL connected');
          connection.release();
          resolve(pool.promise());
        });
      });
    },
    {
      retries: 5,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
      onRetry: (err) => console.log('Retrying MySQL connection:', err.message)
    }
  );
};

module.exports = connectWithRetry();

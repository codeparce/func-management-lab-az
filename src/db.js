const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');

const credential = new DefaultAzureCredential();
const server = process.env.DB_SERVER;
const database = process.env.DB_NAME;

let pool = null;

async function getPool() {
  if (!pool) {
    const accessToken = await credential.getToken('https://database.windows.net/.default');

    pool = await sql.connect({
      server,
      database,
      authentication: {
        type: 'azure-active-directory-access-token',
        options: {
          token: accessToken.token,
        },
      },
      options: {
        encrypt: true,
        trustServerCertificate: false,
        hostNameInCertificate: '*.database.windows.net',
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    });
  }
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

module.exports = { getPool, closePool, sql };

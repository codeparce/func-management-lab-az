const { getPool, sql } = require('../db');

async function getAllUsers() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Users ORDER BY CreatedAt DESC');
  return result.recordset;
}

async function getUserById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM Users WHERE Id = @id');
  return result.recordset[0] || null;
}

async function createUser(name, email) {
  const pool = await getPool();
  const result = await pool.request()
    .input('name', sql.NVarChar(255), name)
    .input('email', sql.NVarChar(255), email || null)
    .query(`
      INSERT INTO Users (Name, Email)
      VALUES (@name, @email);
      SELECT SCOPE_IDENTITY() AS id;
    `);
  return { id: result.recordset[0].id, name, email: email || null };
}

module.exports = { getAllUsers, getUserById, createUser };

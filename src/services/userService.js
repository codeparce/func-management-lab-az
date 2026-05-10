const { getPool } = require('../db');

async function getAllUsers() {
  const pool = await getPool();
  const result = await pool.query(
    'SELECT id, name, email, activo, fecha_creacion FROM users ORDER BY fecha_creacion DESC'
  );
  return result.rows;
}

async function getUserById(id) {
  const pool = await getPool();
  const result = await pool.query(
    'SELECT id, name, email, activo, fecha_creacion FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function getUserByEmail(email) {
  const pool = await getPool();
  const result = await pool.query(
    'SELECT id, name, email, activo, fecha_creacion FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function createUser({ name, email, password_hash = '' }) {
  const pool = await getPool();
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, activo, fecha_creacion`,
    [name, email, password_hash]
  );
  return result.rows[0];
}

module.exports = { getAllUsers, getUserById, getUserByEmail, createUser };

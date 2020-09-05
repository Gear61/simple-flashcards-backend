'use strict'

const { Pool } = require('pg');
const knex = require('knex');

const connectionData = () => {
  return {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 2000, // Raise an error instead of hanging if the connection cannot connect within 2s
    idleTimeoutMillis: 5000, // Close this connection if unclosed and unused for more than  5s
  }
}
// TODO: Convert this to a shared pool, should not need to recreate one on every API call
module.exports.getPool = () => {
  return new Pool(connectionData());
};

module.exports.queryBuilder = () => {
  return knex({
    client: 'pg',
    connection: connectionData(),
  });
}

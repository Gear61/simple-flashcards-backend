'use strict'

const { Pool } = require('pg');
const knex = require('knex');
const moment = require('moment');
const _ = require('lodash');

const connectionData = () => {
  //console.log("DB URL:", process.env.DATABASE_URL)
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

module.exports.parseTime = (time) => {
  const unix = /^[\d]+$/
  const dbFormat = "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"
  if (_.isNumber(time) || !_.isNil(time.match(unix))) { // If we get a unix timestamp in the JSON or a string with a unix timestamp
    const parsedTime = moment.unix(time)
    return { timeUpdated: parsedTime, timeString: parsedTime.format(dbFormat) };
  } else {
    const parsedTime = moment.utc(time);
    return { timeUpdated: parsedTime, timeString: parsedTime.format(dbFormat) };
  }
}
'use strict'

const dbLib = require('../../lib/db.js');
const db = dbLib.queryBuilder();
const authHelper = require('../auth_helper.js');
const _ = require('lodash');
const moment = require('moment');

module.exports = function(request, response) {
  // TODO: Move Auth Token into an Express Middleware Library
  var authToken = request.header('auth_token');
  var expandedToken = authHelper.verify(authToken);
  if (!expandedToken) {
    response.status(401);
    response.send();
    return;
  }
  const { body } = request;
	const { time_last_updated, flashcard_set_id } = body;

  try {
    const { timeUpdated, timeString } = dbLib.parseTime(time_last_updated);

    db
      .select('*')
      .from('flashcard')
      .where('updated_at', '>', timeString)
      .andWhere({flashcard_set_id: flashcard_set_id})
      .then(function(rows) {
        const flashcards = _.chain(rows)
          .map(
            (row) => {
              var change_type = 'updated'
              if(row.deleted) {
                change_type = 'deleted'
              } else if (moment.utc(row.created_at).isAfter(timeUpdated)) {
                change_type = 'added'
              }
              return _.merge(row, {
                time_last_updated: moment.utc(row.updated_at).unix(),
                change_type: change_type,
              })
            }
          )
          .value()
        const responsePayload = {
          flashcards: flashcards
        }
        response.send(responsePayload);
      })
      .catch(function(error) {
        console.error(error);
        response.status(500);
        response.send();
      });
  } catch (exception) {
    console.error(exception.stack)
    response.status(500);
    response.send();
  };
}

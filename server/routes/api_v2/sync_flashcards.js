'use strict'

const db = require('../../lib/db.js').queryBuilder();
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
  
  //Query
  db
    .select('*')
    .from('flashcard')
    .where('updated_at', '>', time_last_updated)
    .andWhere({flashcard_set_id: flashcard_set_id})
    .then(function(rows) {
      const flashcards = _.chain(rows)
        .map(
          (row) => {
            var change_type = 'updated'
            if(row.deleted) {
              change_type = 'deleted'
            } else if (moment(row.created_at).isAfter(time_last_updated)) {
              change_type = 'added'
            }
            return _.merge(rows, {
              time_last_updated: row.updated_at,
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
}

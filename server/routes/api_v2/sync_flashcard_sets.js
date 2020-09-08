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
  // if (!expandedToken) {
  //   response.status(401);
  //   response.send();
  //   return;
  // }
  expandedToken = {
    user_id : 12773
  }
  const { user_id } = expandedToken;
  const { body } = request;
  const { time_last_updated } = body;

  try {
    const { timeUpdated, timeString } = dbLib.parseTime(time_last_updated);

    // Knex functions modify the original instead of returning a copy so have start from db.
    const count_subquery = db.from('flashcard').where('flashcard.flashcard_set_id', '=', db.raw('flashcardset.id')).count('flashcard.id');
    const learned_subquery = db.from('flashcard').where('flashcard.flashcard_set_id', '=', db.raw('flashcardset.id')).andWhere({'flashcard.learned': true}).count('flashcard.id');
    db
      .select(
        '*',
        db.raw(count_subquery.toString()).wrap('(', ') AS flashcards_count'),
        db.raw(learned_subquery.toString()).wrap('(', ') AS learned_count')
      )
      .from('flashcardset')
      .where('updated_at', '>', timeString)
      .andWhere({user_id: _.toNumber(user_id)})
      .then(function(rows) {
        const flashcardSets = _.chain(rows)
          .map(
            (row) => {
              var change_type = 'updated'
              if(row.deleted) {
                change_type = 'deleted'
              } else if (moment.utc(row.created_at).isAfter(timeUpdated)) {
                change_type = 'added'
              }
              const flashcard_count = _.toNumber(row.flashcards_count);
              const learned_count = _.toNumber(row.learned_count);
              const learned_percent = flashcard_count > 0 ? learned_count / flashcard_count : 0;
              return _.merge(row, {
                time_last_updated: moment.utc(row.updated_at).unix(),
                change_type: change_type,
                flashcards_count: flashcard_count,
                learned_count: learned_count,
                learned_percent: learned_percent,
              })
            }
          )
          .value()
        const responsePayload = {
          flashcard_sets: flashcardSets
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

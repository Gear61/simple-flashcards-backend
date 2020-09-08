const sync_flashcard_sets = require('./api_v2/sync_flashcard_sets');
const sync_flashcards = require('./api_v2/sync_flashcards');

module.exports = function(app) {
  app.post('/v2/flashcard_sets/sync', sync_flashcard_sets);
  app.post('/v2/flashcards/sync', sync_flashcards);
}
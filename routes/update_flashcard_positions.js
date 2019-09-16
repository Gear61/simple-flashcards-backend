const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const async = require("async");

module.exports = function(app) {
	app.post('/flashcard/update_positions', async (request, response) => {
		try {
			const client = await pool.connect();
			const flashcardsList = request.body['flashcards'];
			async.forEachOf(flashcardsList, function (dataElement, i, inner_callback) {
				const flashcardId = dataElement['flashcard_id'];
				const position = dataElement['position'];

				const flashcardQuery = 'UPDATE Flashcard SET position = $1 WHERE id = $2'
				const flashcardValues = [position, flashcardId];

				client.query(flashcardQuery, flashcardValues)
				.then(flashcardResults => {
					inner_callback();
				})
				.catch(err => {
					inner_callback(err);
				});
			}, function(err) {
				if(err) {
					console.error(err.stack)
					response.status(500);
				} else {
					response.status(200);
				}
				response.send();
			});
			client.release();
		} catch (err) {
			console.error(err.stack)
			response.status(500);
			response.send();
		}
	});
}

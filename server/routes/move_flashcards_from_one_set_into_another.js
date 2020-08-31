const pool = require('../lib/db').getPool();
const async = require("async");
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/flashcard_set/move_cards_from_another_set', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			if (!expandedToken) {
				response.status(401);
				response.send();
				return;
			}

			const requestBody = request.body;
			const sendingSetId = requestBody['sending_set_id'];
			const receivingSetId = requestBody['receiving_set_id'];

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				const flashcardIds = requestBody['flashcard_ids'];
				for (var i = 0; i < flashcardIds.length; i++) {
					const flashcardId = flashcardIds[i];
					const updateQuery = 'UPDATE Flashcard SET flashcard_set_id = $1 ' +
					'WHERE id = $2 AND flashcard_set_id = $3'
					const values = [receivingSetId, flashcardId, sendingSetId];

					await client.query(updateQuery, values);
				}

				await client.query('COMMIT');
				response.status(200);
				response.send();
			} catch (e) {
				await client.query('ROLLBACK')
				throw e
			} finally {
				client.release()
			}
		} catch (err) {
			console.error(err.stack)
			response.status(500);
			response.send();
		}
	});
}

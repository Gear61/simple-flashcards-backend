const pool = require('../lib/db').getPool();
const async = require("async");
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/flashcard/update_positions', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			if (!expandedToken) {
				response.status(401);
				response.send();
				return;
			}

			const flashcardsList = request.body;

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				for (var i = 0; i < flashcardsList.length; i++) {
					const flashcardId = flashcardsList[i]['flashcard_id'];
					const position = flashcardsList[i]['position'];
					const flashcardQuery = 'UPDATE Flashcard SET position = $1 WHERE id = $2'
					const flashcardValues = [position, flashcardId];

					await client.query(flashcardQuery, flashcardValues);
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

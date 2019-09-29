const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/flashcard_set/create', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			var userId;
			if (expandedToken) {
				userId = expandedToken['user_id'];
			} else {
				response.status(401);
				response.send();
				return;
			}
			
			var requestBody = request.body;
			var localSetId = requestBody['id'];
			var quizletSetId = requestBody['quizlet_set_id'];
			var setName = requestBody['set_name'];
			var flashcardsList = requestBody['flashcards'];

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				const insertQuery = 'INSERT INTO FlashcardSet(user_id, quizlet_set_id, name) ' +
				'VALUES($1, $2, $3) RETURNING id';
				const values = [userId, quizletSetId, setName];
				const { rows } = await client.query(insertQuery, values);
				const setId = rows[0]['id'];

				var addedSet = {
					'old_id': localSetId,
					'new_id': setId
				};

				if (flashcardsList && flashcardsList.length > 0) {
					addedSet['flashcards'] = [];
					for (var i = 0; i < flashcardsList.length; i++) {
						const localFlashcardId = flashcardsList[i]['id'];
						const term = flashcardsList[i]['term'];
						const definition = flashcardsList[i]['definition'];
						const termImageUrl = flashcardsList[i]['term_image_url'];
						const definitionImageUrl = flashcardsList[i]['definition_image_url'];

						const flashcardQuery = 'INSERT INTO Flashcard ' +
						'(flashcard_set_id, term, definition, term_image_url, definition_image_url) ' + 
						'VALUES($1, $2, $3, $4, $5) RETURNING id';
						const flashcardValues = [setId, term, definition, termImageUrl, definitionImageUrl];

						const result = await client.query(flashcardQuery, flashcardValues);
						const flashcardId = result.rows[0]['id'];
						var addedFlashcard = {
							'old_id': localFlashcardId,
							'new_id': flashcardId
						};

						addedSet['flashcards'].push(addedFlashcard);
					}
				}

				await client.query('COMMIT');
				response.send(addedSet);
			} catch (e) {
				await client.query('ROLLBACK')
				throw e
			} finally {
				client.release()
			}
		} catch (exception) {
			console.error(exception.stack)
			response.status(500);
			response.send(exception);
		}
	});
}

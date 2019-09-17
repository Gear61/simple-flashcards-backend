const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.post('/flashcard_set/create', async (request, response) => {
		try {
			var requestBody = request.body;
			
			var userId = requestBody['user_id'];
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
					'id': setId
				};

				if (flashcardsList && flashcardsList.length > 0) {
					addedSet['flashcards'] = [];
					for (var i = 0; i < flashcardsList.length; i++) {
						const term = flashcardsList[i]['term'];
						const definition = flashcardsList[i]['definition'];
						const termImageUrl = flashcardsList[i]['term_image_url'];
						const definitionImageUrl = flashcardsList[i]['definition_image_url'];

						const flashcardQuery = 'INSERT INTO Flashcard ' +
						'(term, definition, term_image_url, definition_image_url) ' + 
						'VALUES($1, $2, $3, $4) RETURNING id';
						const flashcardValues = [term, definition, termImageUrl, definitionImageUrl];

						const result = await client.query(flashcardQuery, flashcardValues);
						const flashcardId = result.rows[0]['id'];
						var addedFlashcard = {
							'id': flashcardId,
							'term': term,
							'definition': definition,
							'term_image_url': termImageUrl,
							'definition_image_url': definitionImageUrl,
							'learned': false,
							'position': 0
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

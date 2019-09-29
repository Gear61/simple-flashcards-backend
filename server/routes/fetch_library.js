const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/user/fetch_library', async (request, response) => {
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

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				var requestBody = request.body;

				var jsonResponse = {
					'flashcard_sets': [],
					'folders': []
				};

				const setsQuery = 'SELECT * FROM FlashcardSet WHERE user_id = $1'
				const setsValues = [userId];
				const result = await client.query(setsQuery, setsValues);

				const flashcardSets = result.rows;
				for (var i = 0; i < flashcardSets.length; i++) {
					const setId = flashcardSets[i]['id'];
					var setToAddIntoResponse = {
						'id': setId,
						'quizlet_set_id': flashcardSets[i]['quizlet_set_id'],
						'name': flashcardSets[i]['name'],
						'terms_language': flashcardSets[i]['terms_language'],
						'definitions_language': flashcardSets[i]['definitions_language'],
						'flashcards': []
					}

					const flashcardsQuery = 'SELECT * FROM Flashcard WHERE flashcard_set_id = $1'
					const flashcardsValues = [setId];
					const flashcardResults = await client.query(flashcardsQuery, flashcardsValues);
					const flashcards = flashcardResults.rows;

					for (var j = 0; j < flashcards.length; j++) {
						var flashcardToAddIntoResponse = {
							'id': flashcards[j]['id'],
							'term': flashcards[j]['term'],
							'definition': flashcards[j]['definition'],
							'term_image_url': flashcards[j]['term_image_url'],
							'learned': flashcards[j]['learned'],
							'position': flashcards[j]['position']
						}

						setToAddIntoResponse['flashcards'].push(flashcardToAddIntoResponse);
					}

					jsonResponse['flashcard_sets'].push(setToAddIntoResponse);
				}

				await client.query('COMMIT');
				response.send(jsonResponse);
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

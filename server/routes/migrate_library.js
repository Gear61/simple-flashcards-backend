const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/user/migrate_library', async (request, response) => {
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
				var setsList = requestBody['flashcard_sets']

				var jsonResponse = {
					'flashcard_sets': [],
					'folders': []
				};

				var oldSetIdToNewIdMap = {};
				// Insert flashcard sets into DB
				for (var i = 0; i < setsList.length; i++) {
					var localSetId = setsList[i]['id'];
					var quizletSetId = setsList[i]['quizlet_set_id'];
					var setName = setsList[i]['set_name'];

					// Insert flashcard set into DB
					const insertQuery = 'INSERT INTO FlashcardSet(user_id, quizlet_set_id, name) ' +
					'VALUES($1, $2, $3) RETURNING id';

					const values = [userId, quizletSetId, setName];
					const { rows } = await client.query(insertQuery, values);
					const serverSetId = rows[0]['id'];

					var setToAddIntoResponse = {
						'old_id': localSetId,
						'new_id': serverSetId,
						'flashcards': []
					}

					// Update the old ID -> new ID map so folder insertion can build the proper relationships
					oldSetIdToNewIdMap[localSetId] = serverSetId;

					var flashcardsList = setsList[i]['flashcards'];
					for (var j = 0; j < flashcardsList.length; j++) {
						const localFlashcardId = flashcardsList[i]['id'];
						const term = flashcardsList[i]['term'];
						const definition = flashcardsList[i]['definition'];
						const termImageUrl = flashcardsList[i]['term_image_url'];
						const definitionImageUrl = flashcardsList[i]['definition_image_url'];

						const flashcardQuery = 'INSERT INTO Flashcard ' +
						'(term, definition, term_image_url, definition_image_url) ' + 
						'VALUES($1, $2, $3, $4) RETURNING id';
						const flashcardValues = [term, definition, termImageUrl, definitionImageUrl];

						const { rows } = await client.query(flashcardQuery, flashcardValues);
						const serverFlashcardId = rows[0]['id'];
						var flashcardToAddIntoResponse = {
							'old_id': localFlashcardId,
							'new_id': serverFlashcardId
						};
						setToAddIntoResponse['flashcards'].push(flashcardToAddIntoResponse);
					}

					jsonResponse['flashcard_sets'].push(setToAddIntoResponse);
				}

				// Insert folders
				var foldersList = requestBody['folders'];
				for (var k = 0; k < foldersList.length; k++) {
					var localFolderId = foldersList[i]['id'];
					var folderName = foldersList[i]['name'];

					var folderToAddIntoResponse = {
						'old_id': localSetId,
						'new_id': serverSetId,
						'flashcards': []
					}
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

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));
const uuidv4 = require('uuid/v4');

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
			var localSetId = requestBody['local_id'];
			var originalSetId = requestBody['original_set_id'];
			var setName = requestBody['name'];
			var termsLanguage = requestBody['terms_language'];
			var definitionsLanguage = requestBody['definitions_language'];
			var flashcardsList = requestBody['flashcards'];

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				var setId = uuidv4();
				const insertQuery = 'INSERT INTO FlashcardSet(id, user_id, original_set_id, name, '
					+ 'terms_language, definitions_language) '
					+ 'VALUES($1, $2, $3, $4, $5, $6)';
				const values = [setId, userId, originalSetId, setName, termsLanguage, definitionsLanguage];
				await client.query(insertQuery, values);

				var addedSet = {
					'local_id': localSetId,
					'server_id': setId
				};

				if (flashcardsList && flashcardsList.length > 0) {
					addedSet['flashcards'] = [];
					for (var i = 0; i < flashcardsList.length; i++) {
						const localFlashcardId = flashcardsList[i]['local_id'];
						const term = flashcardsList[i]['term'];
						const definition = flashcardsList[i]['definition'];
						const termImageUrl = flashcardsList[i]['term_image_url'];
						const definitionImageUrl = flashcardsList[i]['definition_image_url'];

						var flashcardId = uuidv4();
						const flashcardQuery = 'INSERT INTO Flashcard ' +
						'(id, flashcard_set_id, term, definition, term_image_url, definition_image_url) ' + 
						'VALUES($1, $2, $3, $4, $5, $6)';
						const flashcardValues = [flashcardId, setId, term, definition,
						termImageUrl, definitionImageUrl];

						await client.query(flashcardQuery, flashcardValues);
						var addedFlashcard = {
							'local_id': localFlashcardId,
							'server_id': flashcardId
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

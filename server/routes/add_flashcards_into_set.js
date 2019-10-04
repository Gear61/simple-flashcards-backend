const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));
const uuidv4 = require('uuid/v4');

module.exports = function(app) {
	app.post('/flashcard_set/add_flashcards', async (request, response) => {
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
			var setId = requestBody['id'];
			var flashcardsList = requestBody['flashcards'];

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				const findUserQuery = 'SELECT user_id FROM FlashcardSet WHERE id = $1';
				const findUserValues = [setId];
				const { rows } = await client.query(findUserQuery, findUserValues);
				if (rows.length == 0 || rows[0]['user_id'] != userId) {
					response.status(401);
					response.send({error: 'This flashcard set does not belong to the passed in user ID'});
					return;
				}

				var jsonResponse = [];

				for (var i = 0; i < flashcardsList.length; i++) {
					const localFlashcardId = flashcardsList[i]['local_id'];
					const term = flashcardsList[i]['term'];
					const definition = flashcardsList[i]['definition'];
					const termImageUrl = flashcardsList[i]['term_image_url'];

					var flashcardId = uuidv4();
					const flashcardQuery = 'INSERT INTO Flashcard ' +
					'(id, flashcard_set_id, term, definition, term_image_url) ' + 
					'VALUES($1, $2, $3, $4, $5)';
					const flashcardValues = [flashcardId, setId, term, definition, termImageUrl];

					await client.query(flashcardQuery, flashcardValues);
					var addedFlashcard = {
						'local_id': localFlashcardId,
						'server_id': flashcardId
					};

					jsonResponse.push(addedFlashcard);
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
			response.send();
		}
	});
}

const pool = require('../lib/db').getPool();
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));
const uuidv4 = require('uuid/v4');

module.exports = function(app) {
	app.post('/flashcard/create', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			if (!expandedToken) {
				response.status(401);
				response.send();
				return;
			}

			var requestBody = request.body;
			var setId = requestBody['set_id'];
			const setQuery = 'SELECT * FROM FlashcardSet WHERE id = $1';
			const values = [setId];
			const client = await pool.connect();

			client.query(setQuery, values)
			.then(res => {
				if (res.rows.length == 0) {
					response.status(400);
					var error = {'error': 'Flashcard set does not exist'};
					response.send(error);
				} else {
					const localId = requestBody['local_id'];
					var term = requestBody['term'];
					var definition = requestBody['definition'];
					var termImageUrl = requestBody['term_image_url'];
					var definitionImageUrl = requestBody['definition_image_url'];
					var position = requestBody['position'];
					var flashcardId = uuidv4();

					const insertQuery = 'INSERT INTO Flashcard(id, flashcard_set_id, term, definition, ' +
						'term_image_url, definition_image_url, position) VALUES($1, $2, $3, $4, $5, $6, $7)';
					const values = [flashcardId, setId, term, definition,
					termImageUrl, definitionImageUrl, position];

					client.query(insertQuery, values)
					.then(res => {
						var jsonResponse = {
							'local_id': localId,
							'server_id': flashcardId
						}
						response.send(jsonResponse);
					})
					.catch(exception => {
						console.error(exception.stack);
						response.status(500);
						response.send();
					});	
				}
			})
			.catch(exception => {
				console.error(exception.stack)
				response.status(500);
				response.send();
			});

			client.release();
		} catch (exception) {
			console.error(exception.stack)
			response.status(500);
			response.send();
		}
	});
}

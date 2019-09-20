const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/flashcard/update', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			if (!expandedToken) {
				response.status(401);
				response.send();
				return;
			}
			
			var requestBody = request.body;
			var flashcardId = requestBody['flashcard_id'];
			var term = requestBody['term'];
			var definition = requestBody['definition'];
			var termImageUrl = requestBody['term_image_url'];
			var definitionImageUrl = requestBody['definition_image_url'];

			const updateQuery = 'UPDATE Flashcard ' +
			'SET term = $1, definition = $2, term_image_url = $3, definition_image_url = $4 ' +
			'WHERE id = $5'
			const values = [term, definition, termImageUrl, definitionImageUrl, flashcardId];

			const client = await pool.connect();
			client.query(updateQuery, values)
			.then(res => {
				response.status(200);
				response.send();
			})
			.catch(exception => {
				console.error(exception.stack)
				response.status(500);
				response.send(error);
			});

			client.release();
		} catch (exception) {
			console.error(exception.stack)
			response.status(500);
			response.send(error);
		}
	});
}

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/flashcard/update_definition', async (request, response) => {
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
			var definition = requestBody['definition'];

			const updateQuery = 'UPDATE Flashcard SET definition = $1 WHERE id = $2'
			const values = [definition, flashcardId];

			const client = await pool.connect();
			client.query(updateQuery, values)
			.then(res => {
				response.status(200);
				response.send();
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

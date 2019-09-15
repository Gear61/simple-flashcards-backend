const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.post('/flashcard_set/update', async (request, response) => {
		try {
			var requestBody = request.body;
			
			var setId = requestBody['set_id'];
			var setName = requestBody['set_name'];
			var termsLanguage = requestBody['terms_language'];
			var definitionsLanguage = requestBody['definitions_language'];

			const updateQuery = 'UPDATE FlashcardSet ' +
			'SET name = $1, terms_language = $2, definitions_language = $3 ' +
			'WHERE id = $4'
			const values = [setName, termsLanguage, definitionsLanguage, setId];

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

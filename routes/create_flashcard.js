const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.post('/flashcard/create', async (request, response) => {
		try {
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
					var term = requestBody['term'];
					var definition = requestBody['definition'];
					var termImageUrl = requestBody['term_image_url'];
					var definitionImageUrl = requestBody['definition_image_url'];

					const insertQuery = 'INSERT INTO Flashcard(flashcard_set_id, term, definition, ' +
						'term_image_url, definition_image_url) VALUES($1, $2, $3, $4, $5) RETURNING id';
					const values = [setId, term, definition, termImageUrl, definitionImageUrl];

					client.query(insertQuery, values)
					.then(res => {
						response.send(res.rows[0]);
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

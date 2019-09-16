const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.post('/flashcard/delete', async (request, response) => {
		try {
			var requestBody = request.body;
			var flashcardId = requestBody['flashcard_id'];

			const deleteQuery = 'DELETE FROM Flashcard WHERE id = $1';
			const values = [flashcardId];

			const client = await pool.connect();
			client.query(deleteQuery, values)
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

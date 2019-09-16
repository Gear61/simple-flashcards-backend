const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.post('/flashcard_set/delete', async (request, response) => {
		try {
			var requestBody = request.body;
			var setId = requestBody['set_id'];

			const deleteSetQuery = 'DELETE FROM FlashcardSet WHERE id = $1';
			const setValues = [setId];

			const client = await pool.connect();
			client.query(deleteSetQuery, setValues)
			.then(res => {
				const deleteFlashcardsQuery = 'DELETE FROM Flashcard WHERE flashcard_set_id = $1';
				const flashcardValues = [setId];

				client.query(deleteFlashcardsQuery, flashcardValues)
				.then(res => {
					response.status(200);
					response.send();
				})
				.catch(exception => {
					console.error(exception.stack)
					response.status(500);
					response.send(error);
				});
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

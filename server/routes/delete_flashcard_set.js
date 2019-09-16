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

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				const deleteSetQuery = 'DELETE FROM FlashcardSet WHERE id = $1';
				const setValues = [setId];
				await client.query(deleteSetQuery, setValues);

				const deleteFlashcardsQuery = 'DELETE FROM Flashcard WHERE flashcard_set_id = $1';
				const flashcardValues = [setId];
				await client.query(deleteFlashcardsQuery, flashcardValues);

				await client.query('COMMIT');
				response.status(200);
				response.send();
			} catch (e) {
				await client.query('ROLLBACK')
				throw e
			} finally {
				client.release()
			}
		} catch (exception) {
			console.error(exception.stack)
			response.status(500);
			response.send(error);
		}
	});
}

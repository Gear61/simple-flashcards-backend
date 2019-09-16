const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.post('/flashcard_set/create', async (request, response) => {
		try {
			var requestBody = request.body;
			
			var userId = requestBody['user_id'];
			var quizletSetId = requestBody['quizlet_set_id'];
			var setName = requestBody['set_name'];
			var flashcardsList = requestBody['flashcards'];

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				const insertQuery = 'INSERT INTO FlashcardSet(user_id, quizlet_set_id, name) ' +
				'VALUES($1, $2, $3) RETURNING id';
				const values = [userId, quizletSetId, setName];
				const { rows } = await client.query(insertQuery, values);
				const setId = rows[0]['id'];

				await client.query('COMMIT');

				var addedSet = {
					'id': setId
				};
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
			response.send(error);
		}
	});
}

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

			const insertQuery = 'INSERT INTO FlashcardSet(user_id, quizlet_set_id, name) ' +
			'VALUES($1, $2, $3) RETURNING id'
			const values = [userId, quizletSetId, setName];

			const client = await pool.connect();
			client.query(insertQuery, values)
			.then(res => {
				response.send(res.rows[0]);
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

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.post('/flashcard_set/search', async (request, response) => {
		try {
			var requestBody = request.body;
			var userId = requestBody['user_id'];
			var searchInput = requestBody['search_input'];

			// We need to wrap the input, so we do a contains search
			var wrappedInput = '%' + searchInput + '%';

			const query = 'SELECT FlashcardSet.id as set_id, name as set_name, count(*) as num_flashcards '
			 	+ 'FROM FlashcardSet INNER JOIN Flashcard ON FlashcardSet.id = Flashcard.flashcard_set_id ' 
				+ 'WHERE user_id != $1 AND name ILIKE $2 GROUP BY FlashcardSet.id, name LIMIT 30';
			const values = [userId, wrappedInput];

			const client = await pool.connect();
			client.query(query, values)
			.then(res => {
				var flashcardSetsList = [];
				for (var i = 0; i < res.rows.length; i++) {
					var setToAdd = {
						'set_id': res.rows[i]['set_id'],
						'set_name': res.rows[i]['set_name'],
						'num_flashcards': res.rows[i]['num_flashcards']
					};
					flashcardSetsList.push(setToAdd);
				}
				response.send(flashcardSetsList);
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

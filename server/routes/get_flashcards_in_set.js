const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.post('/flashcard_set/fetch_cards', async (request, response) => {
		try {
			var requestBody = request.body;
			var setId = requestBody['set_id'];

			const query = 'SELECT * FROM Flashcard WHERE flashcard_set_id = $1'
			const values = [setId];

			const client = await pool.connect();
			client.query(query, values)
			.then(res => {
				var flashcardsList = [];
				for (var i = 0; i < res.rows.length; i++) {
					var flashcardToAdd = {
						'id': res.rows[i]['id'],
						'term': res.rows[i]['term'],
						'definition': res.rows[i]['definition'],
						'term_image_url': res.rows[i]['term_image_url'],
						'definition_image_url': res.rows[i]['definition_image_url'],
						'position': res.rows[i]['position']
					};
					flashcardsList.push(flashcardToAdd);
				}
				response.send(flashcardsList);
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

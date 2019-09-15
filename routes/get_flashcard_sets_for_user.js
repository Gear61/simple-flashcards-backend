const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.post('/user/fetch_sets', async (request, response) => {
		try {
			var requestBody = request.body;
			var userId = requestBody['user_id'];

			const query = 'SELECT * FROM FlashcardSet WHERE user_id = $1'
			const values = [userId];

			const client = await pool.connect();
			client.query(query, values)
			.then(res => {
				var setsResponse = [];
				for (var i = 0; i < res.rows.length; i++) {
					var setToAdd = {
						'id': res.rows[i]['id'],
						'quizlet_set_id': res.rows[i]['quizlet_set_id'],
						'name': res.rows[i]['name'],
						'terms_language': res.rows[i]['terms_language'],
						'definitions_language': res.rows[i]['definitions_language']
					};
					setsResponse.push(setToAdd);
				}
				response.send(setsResponse);
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

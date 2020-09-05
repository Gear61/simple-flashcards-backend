const pool = require('../lib/db').getPool();
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/flashcard/delete', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			if (!expandedToken) {
				response.status(401);
				response.send();
				return;
			}

			var requestBody = request.body;
			var flashcardId = requestBody['id'];

			const deleteQuery = 'UPDATE Flashcard SET deleted = true WHERE id = $1';
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

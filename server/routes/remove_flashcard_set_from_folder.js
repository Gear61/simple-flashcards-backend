const pool = require('../lib/db').getPool();
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/folder/remove_set', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			if (!expandedToken) {
				response.status(401);
				response.send();
				return;
			}

			var requestBody = request.body;
			var folderId = requestBody['folder_id'];
			var setId = requestBody['flashcard_set_id'];

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				const deleteConnectionQuery =
				'UPDATE FlashcardSetInFolder SET deleted = true WHERE folder_id = $1 and flashcard_set_id = $2';
				const deleteConnectionsValues = [folderId, setId];
				await client.query(deleteConnectionQuery, deleteConnectionsValues);

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

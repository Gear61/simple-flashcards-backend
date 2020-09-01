const pool = require('../lib/db').getPool();
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/folder/add_sets', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			if (!expandedToken) {
				response.status(401);
				response.send();
				return;
			}

			var requestBody = request.body;
			var folderId = requestBody['id'];
			var setIds = requestBody['flashcard_set_ids'];

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				for (var i = 0; i < setIds.length; i++) {
					const insertConnectionQuery =
					'INSERT INTO FlashcardSetInFolder(folder_id, flashcard_set_id)' +
					' VALUES($1, $2)';
					const insertConnectionsValues = [folderId, setIds[i]];
					await client.query(insertConnectionQuery, insertConnectionsValues);
				}

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

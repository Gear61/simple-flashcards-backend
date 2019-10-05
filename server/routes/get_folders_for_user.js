const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/user/fetch_folders', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			var userId;
			if (expandedToken) {
				userId = expandedToken['user_id'];
			} else {
				response.status(401);
				response.send();
				return;
			}

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				var jsonResponse = [];

				const foldersQuery = 'SELECT * FROM Folder WHERE user_id = $1'
				const foldersValues = [userId];
				const folderResults = await client.query(foldersQuery, foldersValues);
				const folders = folderResults.rows;
				for (var k = 0; k < folders.length; k++) {
					const folderId = folders[k]['id'];
					var folderForResponse = {
						'id': folderId,
						'name': folders[k]['name'],
						'flashcard_set_ids': []
					}

					const setsInFolderQuery = 'SELECT * FROM FlashcardSetInFolder WHERE folder_id = $1'
					const setsInFolderValues = [folderId];
					const setsInFolderResults = await client.query(setsInFolderQuery, setsInFolderValues);
					const setsInFolders = setsInFolderResults.rows;

					for (var l = 0; l < setsInFolders.length; l++) {
						folderForResponse['flashcard_set_ids'].push(setsInFolders[l]['flashcard_set_id']);
					}

					jsonResponse.push(folderForResponse);
				}

				await client.query('COMMIT');
				response.send(jsonResponse);
			} catch (e) {
				await client.query('ROLLBACK')
				throw e
			} finally {
				client.release()
			}
		} catch (exception) {
			console.error(exception.stack)
			response.status(500);
			response.send(exception);
		}
	});
}

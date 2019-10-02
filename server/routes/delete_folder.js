const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/folder/delete', async (request, response) => {
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

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				console.log("Deleting folder with ID: " + folderId);

				const deleteFolderQuery = 'DELETE FROM Folder WHERE id = $1';
				const deleteFolderValues = [folderId];
				await client.query(deleteFolderQuery, deleteFolderValues);

				const deleteConnectionsQuery = 'DELETE FROM FlashcardSetInFolder WHERE folder_id = $1';
				const deleteConnectionsValues = [folderId];
				await client.query(deleteConnectionsQuery, deleteConnectionsValues);

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

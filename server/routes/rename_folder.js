const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/folder/rename', async (request, response) => {
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
			var folderName = requestBody['name'];
			const folderQuery = 'UPDATE Folder SET name = $1 WHERE id = $2';
			const values = [folderName, folderId];
			const client = await pool.connect();

			client.query(folderQuery, values)
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

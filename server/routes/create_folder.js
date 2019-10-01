const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/folder/create', async (request, response) => {
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

			var requestBody = request.body;
			var folderId = requestBody['id'];
			var folderName = requestBody['name'];
			const folderQuery = 'INSERT INTO Folder(user_id, name) VALUES($1, $2) RETURNING id';
			const values = [userId, folderName];
			const client = await pool.connect();

			client.query(folderQuery, values)
			.then(res => {
				const serverFolderId = res.rows[0]['id'];
				var jsonResponse = {
					'old_id': folderId,
					'new_id': serverFolderId
				}
				response.status(200);
				response.send(jsonResponse);
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

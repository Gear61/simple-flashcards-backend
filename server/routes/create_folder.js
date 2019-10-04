const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));
const uuidv4 = require('uuid/v4');

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
			const serverFolderId = uuidv4();
			var localFolderId = requestBody['local_id'];
			var folderName = requestBody['name'];
			const folderQuery = 'INSERT INTO Folder(id, user_id, name) VALUES($1, $2, $3)';
			const values = [serverFolderId, userId, folderName];
			const client = await pool.connect();

			client.query(folderQuery, values)
			.then(res => {
				var jsonResponse = {
					'local_id': localFolderId,
					'server_id': serverFolderId
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

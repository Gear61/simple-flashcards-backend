const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const FB = require('fb');

module.exports = function(app) {
	app.post('/onboarding/facebook', function(request, response) {
		const accessToken = request.body['access_token'];

		FB.setAccessToken(accessToken);
		FB.api('me', { fields: ['name', 'email', 'picture.type(large)'] }, function (user_info) {
			if(!user_info || user_info.error) {
				response.status(400);
				response.send({'error': user_info.error});
				return;
			}

			const name = user_info.name;
			const email = user_info.email;
			const profilePictureUrl = user_info.picture.data.url;
			signUp(name, email, profilePictureUrl, 'FACEBOOK', response);
		});
	});
}

async function signUp(name, email, profilePictureUrl, loginType, response) {
	const accountQuery = 'SELECT name, email, profile_picture_url, login_type FROM Account WHERE email = $1';
	const values = [email];

	const client = await pool.connect();
	client.query(accountQuery, values)
	.then(res => {
		client.end();

			// Account doesn't exist yet; create it and return
			if (res.rows.length == 0) {
				console.log("Account doesn't exist for email: " + email);
				createAccount(name, email, profilePictureUrl, loginType, response, client);
			} else {
				if (res.rows[0].login_type == loginType) {
					console.log("Account already created with " + loginType);
					response.send(res.rows[0]);
				} else {
					console.log("Email already used, can't create with " + loginType);
					response.status(401);
					const error = {'error': 'email_in_use'};
					response.send(error);
				}
			}
		})
	.catch(e => {
		console.error(e.stack)
		response.status(500);
		response.send(error);
	});
}

async function createAccount(name, email, profilePictureUrl, loginType, response, dbClient) {
	const insert_query = 'INSERT INTO Account(name, email, profile_picture_url, login_type) ' +
	'VALUES($1, $2, $3, $4) RETURNING name, email, profile_picture_url'
	const values = [name, email, profilePictureUrl, loginType];

	dbClient.query(insert_query, values)
	.then(res => {
		response.send(res.rows[0]);
	})
	.catch(e => {
		console.error(e.stack)
		response.status(500);
		response.send(error);
	});
}
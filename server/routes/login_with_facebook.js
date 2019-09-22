const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const FB = require('fb');
const authHelper  = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/onboarding/facebook', function(request, response) {
		const accessToken = request.body['access_token'];

		FB.setAccessToken(accessToken);
		FB.api('me', { fields: ['id', 'name', 'email'] }, function (user_info) {
			if(!user_info || user_info.error) {
				response.status(400);
				response.send({'error': user_info.error});
				return;
			}

			const name = user_info.name;
			const email = user_info.email;
			const profilePictureUrl = "http://graph.facebook.com/" + user_info.id + "/picture?type=large";
			signUp(name, email, profilePictureUrl, 'FACEBOOK', response);
		});
	});
}

async function signUp(name, email, profilePictureUrl, loginType, response) {
	const accountQuery = 'SELECT id, name, email, profile_picture_url, login_type FROM Account WHERE email = $1';
	const values = [email];

	const client = await pool.connect();
	client.query(accountQuery, values)
	.then(res => {
		client.end();

			// Account doesn't exist yet; create it and return
			if (res.rows.length == 0) {
				console.log("Account doesn't exist for email: " + email);
				createAccount(name, email, profilePictureUrl, loginType, response);
			} else {
				if (res.rows[0].login_type == loginType) {
					console.log("Account already created with " + loginType);

					var payload = {
						user_id: res.rows[0].id
					}
					var authToken = authHelper.sign(payload);
					var responseJson = {
						auth_token: authToken,
						name: res.rows[0].name,
						email: res.rows[0].email,
						profile_picture_url: res.rows[0].profile_picture_url,
						new_account: false
					}

					response.send(responseJson);
				} else {
					console.log("Email already used, can't create with " + loginType);
					response.status(401);
					const error = {'error': 'email_in_use'};
					response.send(error);
				}
			}
		})
	.catch(exception => {
		console.error(exception.stack)
		response.status(500);
		response.send();
	});
}

async function createAccount(name, email, profilePictureUrl, loginType, response) {
	const insert_query = 'INSERT INTO Account(name, email, profile_picture_url, login_type) ' +
	'VALUES($1, $2, $3, $4) RETURNING id, name, email, profile_picture_url'
	const values = [name, email, profilePictureUrl, loginType];

	const client = await pool.connect();
	client.query(insert_query, values)
	.then(res => {
		var payload = {
			user_id: res.rows[0].id
		}
		var authToken = authHelper.sign(payload);
		var responseJson = {
			auth_token: authToken,
			name: res.rows[0].name,
			email: res.rows[0].email,
			profile_picture_url: res.rows[0].profile_picture_url,
			new_account: true
		}
		response.send(responseJson);
	})
	.catch(exception => {
		console.error(exception.stack)
		response.status(500);
		response.send();
	});
}
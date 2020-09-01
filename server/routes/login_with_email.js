const pool = require('../lib/db').getPool();

const authHelper  = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/onboarding/email', async (request, response) => {
		try {
			if (!('email' in request.body)) {
				response.status(401);
				response.send({error: 'Email address missing from payload'});
				return;
			}

			const email = request.body['email'];
			const name = request.body['name'];
			const profilePictureUrl = request.body['profile_picture_url'];
			const loginType = request.body['login_type'];

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				var statusCode = 200;
				var responseJson = {};

				const findUserQuery = 'SELECT id, name, email, profile_picture_url, login_type '
				+ 'FROM Account WHERE email = $1';
				const findUserValues = [email];

				const results = await client.query(findUserQuery, findUserValues);
				if (results.rows.length > 0) {
					// Account already exists, do the login flow
					if (results.rows[0].login_type == loginType) {
						console.log("Account already created with " + loginType + " for email: " + email);
						var payload = {
							user_id: results.rows[0].id
						}
						var authToken = authHelper.sign(payload);
						console.log("Auth token: " + authToken);
						responseJson = {
							auth_token: authToken,
							name: results.rows[0].name,
							email: results.rows[0].email,
							profile_picture_url: results.rows[0].profile_picture_url,
							new_account: false
						}
					}
					// Email already used for a different login type, reject
					else {
						console.log("Email " + email + " already used, can't create with " + loginType);
						statusCode = 401;
						responseJson = {'error': 'email_in_use'};
					}
				}
				// Account doesn't exist, sign up flow
				else {
					console.log("Creating an account for \"" + name + "\" with email \"" +
						email + "\" using " + loginType + " flow");

					const createAccountQuery = 'INSERT INTO Account(name, email, profile_picture_url, ' +
						'login_type) VALUES($1, $2, $3, $4) RETURNING id'
					const createAccountValues = [name, email, profilePictureUrl, loginType];
					const createResult = await client.query(createAccountQuery, createAccountValues);

					var payload = {
						user_id: createResult.rows[0].id
					}
					var authToken = authHelper.sign(payload);
					responseJson = {
						auth_token: authToken,
						name: name,
						email: email,
						profile_picture_url: profilePictureUrl,
						new_account: true
					}
				}

				response.status(statusCode);
				response.send(responseJson);

				await client.query('COMMIT');
			} catch (e) {
				await client.query('ROLLBACK')
				throw e
			} finally {
				client.release()
			}
		} catch (exception) {
			console.error(exception.stack)
			response.status(500);
			response.send();
		}
	});
}

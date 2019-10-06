const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

const {OAuth2Client} = require('google-auth-library');
const GOOGLE_CLIENT_ID = "437392266366-56mfdfhjukaoqagao7a32r0juk6mt8qk.apps.googleusercontent.com";
const google_oauth_client = new OAuth2Client(GOOGLE_CLIENT_ID);

const authHelper  = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/onboarding/google', function(request, response) {
		const idToken = request.body['auth_token'];
		console.log("Onboarding with GOOGLE with token: " + idToken);
		verifyGoogleToken(idToken, response)
		.catch(exception => {
			console.error(exception.stack)
			response.status(500);
			response.send();
		});
	});
}

async function verifyGoogleToken(token, response) {
	const ticket = await google_oauth_client.verifyIdToken({
		idToken: token,
		audience: GOOGLE_CLIENT_ID,
	});
	const payload = ticket.getPayload();
	console.log(JSON.stringify(payload));

	if (!('email' in payload)) {
		response.status(401);
		response.send({error: 'No email tied to this Google account'});
		return;
	}

	const name = payload.name;
	const email = payload.email;
	const profilePictureUrl = payload.picture;

	console.log("GOOGLE onboarding with - EMAIL: " + email + " || NAME: " + name
		+ " || PROFILE PICTURE: " + profilePictureUrl);

	signUp(name, email, profilePictureUrl, 'GOOGLE', response);
}

async function signUp(name, email, profilePictureUrl, loginType, response) {
	const accountQuery = 'SELECT id, name, email, profile_picture_url, login_type '
	+ 'FROM Account WHERE email = $1';
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
					console.log("Auth token: " + authToken);
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
	'VALUES($1, $2, $3, $4) RETURNING id'
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
			name: name,
			email: email,
			profile_picture_url: profilePictureUrl,
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

const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

const {OAuth2Client} = require('google-auth-library');
const GOOGLE_CLIENT_ID = "336743094335-5i9gndd0b8so6dp727jgeaf00co2elms.apps.googleusercontent.com";
const google_oauth_client = new OAuth2Client(GOOGLE_CLIENT_ID);

module.exports = function(app) {
	app.post('/onboarding/google', function(request, response) {
		const idToken = request.body['id_token'];
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

	const name = payload.name;
	const email = payload.email;
	const profilePictureUrl = payload.picture
	signUp(name, email, profilePictureUrl, 'GOOGLE', response);
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
				createAccount(name, email, profilePictureUrl, loginType, response);
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
	.catch(exception => {
		console.error(exception.stack)
		response.status(500);
		response.send();
	});
}

async function createAccount(name, email, profilePictureUrl, loginType, response) {
	const insert_query = 'INSERT INTO Account(name, email, profile_picture_url, login_type) ' +
	'VALUES($1, $2, $3, $4) RETURNING name, email, profile_picture_url'
	const values = [name, email, profilePictureUrl, loginType];

	const client = await pool.connect();
	client.query(insert_query, values)
	.then(res => {
		response.send(res.rows[0]);
	})
	.catch(exception => {
		console.error(exception.stack)
		response.status(500);
		response.send();
	});
}

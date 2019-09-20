const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const async = require("async");
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/user/fetch_sets', async (request, response) => {
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

			const query = 'SELECT * FROM FlashcardSet WHERE user_id = $1'
			const values = [userId];

			const client = await pool.connect();
			client.query(query, values)
			.then(res => {
				var setsResponse = [];
				async.forEachOf(res.rows, function (dataElement, i, inner_callback){
					const setId = dataElement['id'];
					var setToAdd = {
						'id': setId,
						'quizlet_set_id': dataElement['quizlet_set_id'],
						'name': dataElement['name'],
						'terms_language': dataElement['terms_language'],
						'definitions_language': dataElement['definitions_language']
					};

					const flashcardQuery = 'SELECT * FROM Flashcard WHERE flashcard_set_id = $1'
					const flashcardValues = [setId];

					client.query(flashcardQuery, flashcardValues)
					.then(flashcardResults => {
						var flashcardsList = [];
						for (var i = 0; i < flashcardResults.rows.length; i++) {
							var flashcardToAdd = {
								'id': flashcardResults.rows[i]['id'],
								'term': flashcardResults.rows[i]['term'],
								'definition': flashcardResults.rows[i]['definition'],
								'term_image_url': flashcardResults.rows[i]['term_image_url'],
								'definition_image_url': flashcardResults.rows[i]['definition_image_url'],
								'learned': flashcardResults.rows[i]['learned'],
								'position': flashcardResults.rows[i]['position']
							};
							flashcardsList.push(flashcardToAdd);
						}
						setToAdd['flashcards'] = flashcardsList;
						setsResponse.push(setToAdd);
						inner_callback();
					})
					.catch(exception => {
						inner_callback(exception);
					});
				}, function(err) {
					if(err) {
						console.error(exception.stack)
						response.status(500);
						response.send();
					} else {
						response.send(setsResponse);
					}
				});
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

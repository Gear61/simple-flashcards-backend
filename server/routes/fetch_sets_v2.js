const pool = require('../lib/db').getPool();
const async = require("async");
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

// v2 of the fetch flashcard sets endpoint which paginates and only fetches 5 sets at a time
module.exports = function(app) {
	app.post('/user/fetch_flashcard_sets', async (request, response) => {
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

			var lastSetIdParameter = request.body['last_set_id'];
			var lastSetId = lastSetIdParameter ? lastSetIdParameter : -1;

			const query = 'SELECT * FROM FlashcardSet WHERE user_id = $1 AND numeric_id > $2 AND deleted = false '
				+ 'ORDER BY numeric_id ASC LIMIT 3';
			const values = [userId, lastSetId];

			const client = await pool.connect();
			client.query(query, values)
			.then(res => {
				var setsResponse = [];
				async.forEachOf(res.rows, function (dataElement, i, inner_callback){
					const setId = dataElement['id'];
					var setToAdd = {
						'id': setId,
						'numeric_id': dataElement['numeric_id'],
						'original_set_id': dataElement['original_set_id'],
						'name': dataElement['name'],
						'terms_language': dataElement['terms_language'],
						'definitions_language': dataElement['definitions_language']
					};

					const flashcardQuery = 'SELECT * FROM Flashcard WHERE flashcard_set_id = $1 AND deleted = false'
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

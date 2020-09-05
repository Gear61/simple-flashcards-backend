const pool = require('../lib/db').getPool();
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/flashcard_set/search', async (request, response) => {
		try {
			var authToken = request.header('auth_token');
			var expandedToken = authHelper.verify(authToken);
			var userId = expandedToken ? expandedToken['user_id'] : -1;

			var requestBody = request.body;
			var searchInput = requestBody['search_input'];

			// We need to wrap the input, so we do a contains search
			var wrappedInput = '%' + searchInput + '%';

			const query = 'SELECT * FROM '
			    + '(SELECT FlashcardSet.id as set_id, name as set_name, count(*) as num_flashcards, '
			    + 'terms_language, definitions_language '
			 	+ 'FROM FlashcardSet INNER JOIN Flashcard ON FlashcardSet.id = Flashcard.flashcard_set_id AND FlashcardSet.deleted = false ' 
				+ 'WHERE user_id != $1 AND name ILIKE $2 GROUP BY FlashcardSet.id, name, '
				+ 'terms_language, definitions_language LIMIT 35) AS A '
				+ 'WHERE num_flashcards > 0';
			const values = [userId, wrappedInput];

			const client = await pool.connect();
			client.query(query, values)
			.then(res => {
				var flashcardSetsList = [];
				for (var i = 0; i < res.rows.length; i++) {
					var setToAdd = {
						'set_id': res.rows[i]['set_id'],
						'set_name': res.rows[i]['set_name'],
						'terms_language': res.rows[i]['terms_language'],
						'definitions_language': res.rows[i]['definitions_language'],
						'num_flashcards': res.rows[i]['num_flashcards']
					};
					flashcardSetsList.push(setToAdd);
				}
				response.send(flashcardSetsList);
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

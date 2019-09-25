const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));

module.exports = function(app) {
	app.post('/user/migrate_library', async (request, response) => {
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

			const client = await pool.connect();
			try {
				await client.query('BEGIN');

				var requestBody = request.body;
				var setsList = requestBody['flashcard_sets']

				var jsonResponse = {
					'flashcard_sets': [],
					'folders': []
				};

				var oldSetIdToNewIdMap = {};
				// Insert flashcard sets into DB
				var setListLength = setsList ? setsList.length : 0;
				for (var i = 0; i < setListLength; i++) {
					var localSetId = setsList[i]['id'];
					var quizletSetId = setsList[i]['quizlet_set_id'];
					var setName = setsList[i]['set_name'];

					// Insert flashcard set into DB
					var insertQuery = 'INSERT INTO FlashcardSet(user_id, quizlet_set_id, name) ' +
					'VALUES($1, $2, $3) RETURNING id';

					var values = [userId, quizletSetId, setName];
					var result = await client.query(insertQuery, values);

					var serverSetId = result.rows[0]['id'];

					var setToAddIntoResponse = {
						'old_id': localSetId,
						'new_id': serverSetId,
						'flashcards': []
					}

					// Update the old ID -> new ID map so folder insertion can build the proper relationships
					oldSetIdToNewIdMap[localSetId] = serverSetId;

					var flashcardsList = setsList[i]['flashcards'];
					var flashcardListLength = flashcardsList ? flashcardsList.length : 0;
					for (var j = 0; j < flashcardListLength.length; j++) {
						var localFlashcardId = flashcardsList[j]['id'];
						var term = flashcardsList[j]['term'];
						var definition = flashcardsList[j]['definition'];
						var termImageUrl = flashcardsList[j]['term_image_url'];
						var definitionImageUrl = flashcardsList[j]['definition_image_url'];

						var flashcardQuery = 'INSERT INTO Flashcard ' +
						'(term, definition, term_image_url, definition_image_url) ' + 
						'VALUES($1, $2, $3, $4) RETURNING id';
						var flashcardValues = [term, definition, termImageUrl, definitionImageUrl];

						var flashcardResults = await client.query(flashcardQuery, flashcardValues);
				
						var serverFlashcardId = flashcardResults.rows[0]['id'];
						var flashcardToAddIntoResponse = {
							'old_id': localFlashcardId,
							'new_id': serverFlashcardId
						};
						setToAddIntoResponse['flashcards'].push(flashcardToAddIntoResponse);
					}

					jsonResponse['flashcard_sets'].push(setToAddIntoResponse);
				}

				// Insert folders
				var foldersList = requestBody['folders'];
				var folderListLength = foldersList ? foldersList.length : 0;
				for (var k = 0; k < folderListLength; k++) {
					var localFolderId = foldersList[k]['id'];
					var folderName = foldersList[k]['name'];

					// Insert folder into DB
					var insertFolderQuery = 'INSERT INTO Folder(user_id, name) ' +
					'VALUES($1, $2) RETURNING id';

					var folderValues = [userId, folderName];
					var folderResults = await client.query(insertFolderQuery, folderValues);
					var serverFolderId = folderResults.rows[0]['id'];

					var folderToAddIntoResponse = {
						'old_id': localFolderId,
						'new_id': serverFolderId
					}
					jsonResponse['folders'].push(folderToAddIntoResponse);

					var localSetIds = foldersList[k]['flashcard_set_ids'];
					var setIdListLength = localSetIds ? localSetIds.length : 0;
					for (var l = 0; l < setIdListLength.length; l++) {
						var localSetId = localSetIds[l];
						var newSetId = oldSetIdToNewIdMap[localSetId];

						// Insert folder into DB
						var insertSetFolderRelationQuery = 'INSERT INTO FlashcardSetInFolder' +
						'(flashcard_set_id, folder_id) VALUES($1, $2)';

						var setFolderValues = [newSetId, serverFolderId];
						await client.query(insertSetFolderRelationQuery, setFolderValues);
					}
				}

				await client.query('COMMIT');
				response.send(jsonResponse);
			} catch (e) {
				await client.query('ROLLBACK')
				throw e
			} finally {
				client.release()
			}
		} catch (exception) {
			console.error(exception.stack)
			response.status(500);
			response.send(exception);
		}
	});
}

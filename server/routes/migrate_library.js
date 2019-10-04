const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});
const authHelper = require(require('path').resolve(__dirname, './auth_helper.js'));
const uuidv4 = require('uuid/v4');

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

				var jsonResponse = {
					'flashcard_sets': [],
					'folders': []
				};

				var oldSetIdToNewIdMap = {};
				// Insert flashcard sets into DB
				var setsList = requestBody['flashcard_sets']
				var setListLength = setsList ? setsList.length : 0;
				console.log("MIGRATE LIBRARY - # of sets to migrate: " + setListLength);
				for (var i = 0; i < setListLength; i++) {
					var localSetId = setsList[i]['local_id'];
					var quizletSetId = setsList[i]['quizlet_set_id'];
					var setName = setsList[i]['name'];
					var termsLanguage = setsList[i]['terms_language'];
					var definitionsLanguage = setsList[i]['definitions_language'];

					var serverSetId = uuidv4();

					// Insert flashcard set into DB
					var insertQuery = 'INSERT INTO FlashcardSet(id, user_id, quizlet_set_id, name, ' +
					'terms_language, definitions_language) VALUES($1, $2, $3, $4, $5, $6)';

					var values = [serverSetId, userId, quizletSetId, setName,
					termsLanguage, definitionsLanguage];
					await client.query(insertQuery, values);

					var setToAddIntoResponse = {
						'local_id': localSetId,
						'server_id': serverSetId,
						'flashcards': []
					}

					// Update the old ID -> new ID map so folder insertion can build the proper relationships
					oldSetIdToNewIdMap[localSetId] = serverSetId;

					var flashcardsList = setsList[i]['flashcards'];
					var flashcardListLength = flashcardsList ? flashcardsList.length : 0;
					console.log("MIGRATE LIBRARY - # of flashcards to migrate for set ID "
						+ localSetId + ": " + flashcardListLength);
					for (var j = 0; j < flashcardListLength; j++) {
						var localFlashcardId = flashcardsList[j]['local_id'];
						var term = flashcardsList[j]['term'];
						var definition = flashcardsList[j]['definition'];
						var termImageUrl = flashcardsList[j]['term_image_url'];
						var definitionImageUrl = flashcardsList[j]['definition_image_url'];
						var learned = flashcardsList[j]['learned'];
						var position = flashcardsList[j]['position'];
						var serverFlashcardId = uuidv4();

						var flashcardQuery = 'INSERT INTO Flashcard ' +
						'(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, ' +
						'learned, position) VALUES($1, $2, $3, $4, $5, $6, $7, $8)';
						var flashcardValues = [serverFlashcardId, serverSetId, term, definition,
						termImageUrl, definitionImageUrl, learned, position];

						await client.query(flashcardQuery, flashcardValues);
				
						var flashcardToAddIntoResponse = {
							'local_id': localFlashcardId,
							'server_id': serverFlashcardId
						};
						setToAddIntoResponse['flashcards'].push(flashcardToAddIntoResponse);
					}

					jsonResponse['flashcard_sets'].push(setToAddIntoResponse);
				}

				// Insert folders
				var foldersList = requestBody['folders'];
				var folderListLength = foldersList ? foldersList.length : 0;
				console.log("MIGRATE LIBRARY - # of folders to migrate: " + folderListLength);
				for (var k = 0; k < folderListLength; k++) {
					var localFolderId = foldersList[k]['local_id'];
					var folderName = foldersList[k]['name'];
					var serverFolderId = uuidv4();

					// Insert folder into DB
					var insertFolderQuery = 'INSERT INTO Folder(id, user_id, name) ' +
					'VALUES($1, $2, $3)';

					var folderValues = [serverFolderId, userId, folderName];
					await client.query(insertFolderQuery, folderValues);

					var folderToAddIntoResponse = {
						'local_id': localFolderId,
						'server_id': serverFolderId
					}
					jsonResponse['folders'].push(folderToAddIntoResponse);

					var localSetIds = foldersList[k]['local_flashcard_set_ids'];
					var setIdListLength = localSetIds ? localSetIds.length : 0;
					for (var l = 0; l < setIdListLength; l++) {
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

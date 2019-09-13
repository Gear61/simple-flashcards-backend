INSERT INTO Account (name, email, profile_picture_url, login_type, password) 
VALUES (
	'Alex', 
	'pusheen9001@gmail.com',
	'http://pm1.narvii.com/6448/83fa949d87b32b38857acc03afb806be41adcab8_00.jpg',
	'GOOGLE',
	'dankmemes');

INSERT INTO Account (name, email, profile_picture_url, login_type, password) 
VALUES (
	'Laith', 
	'laithiscool@gmail.com',
	'https://upload.wikimedia.org/wikipedia/en/4/4d/Shrek_%28character%29.png',
	'FACEBOOK',
	'shrek');

INSERT INTO FlashcardSet(user_id, quizlet_set_id, name, terms_language, definitions_language)
VALUES (1, 5902, 'Math Test Practice', 0, 0);

INSERT INTO Flashcard(flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES (1, 'What is 2 + 2?', '4', NULL, NULL, FALSE, 0);
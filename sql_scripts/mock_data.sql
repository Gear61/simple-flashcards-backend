-- Create users
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

-- Create flashcard sets
INSERT INTO FlashcardSet(id, user_id, quizlet_set_id, name, terms_language, definitions_language)
VALUES ('set_one', 1, 5902, 'Math Test Practice', 0, 0);

INSERT INTO FlashcardSet(id, user_id, quizlet_set_id, name, terms_language, definitions_language)
VALUES ('set_two', 1, 2958, 'American Capitals', 0, 0);

INSERT INTO FlashcardSet(id, user_id, quizlet_set_id, name, terms_language, definitions_language)
VALUES ('set_three', 2, 5902934, 'My Hero Academia', 0, 0);

-- Create flashcards
INSERT INTO Flashcard(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES ('card_one', 'set_one', 'What is 2 + 2?', '4', NULL, NULL, FALSE, 0);

INSERT INTO Flashcard(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES ('card_two', 'set_one', 'What is 17 - 8?', '9', NULL, NULL, TRUE, 1);

INSERT INTO Flashcard(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES ('card_three', 'set_one', 'What is 178 % 2?', '89', NULL, NULL, FALSE, 2);

INSERT INTO Flashcard(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES ('card_four', 'set_one', 'What is 0 % 0?', 'Undefined', NULL, NULL, FALSE, 3);

INSERT INTO Flashcard(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES ('card_five', 'set_two', 'California', 'Sacramento', NULL, NULL, TRUE, 0);

INSERT INTO Flashcard(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES ('card_six', 'set_two', 'Arizona', 'Phoenix', NULL, NULL, FALSE, 1);

INSERT INTO Flashcard(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES ('card_seven', 'set_three', 'Who is All Might?', 'The greatest superhero of all time', NULL, NULL, TRUE, 0);

-- To escape single quotes, you need to place another single quote in front of it
INSERT INTO Flashcard(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES ('card_eight', 'set_three', 'What is All Might''s quirk?', 'One for all', NULL, NULL, TRUE, 1);

INSERT INTO Flashcard(id, flashcard_set_id, term, definition, term_image_url, definition_image_url, learned, position)
VALUES ('card_nine', 'set_three', 'What is the theme song of My Hero Academia?', 'You Say Run', NULL, NULL, TRUE, 2);
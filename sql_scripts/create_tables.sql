-- You can't create a table named User in Postgres; it is a reserved keyword
CREATE TABLE IF NOT EXISTS Account (
	id SERIAL,
	name varchar(256),
	email varchar(256),
	profile_picture_url varchar(1024),
	login_type varchar(16),
	password varchar(512)
);

CREATE TABLE IF NOT EXISTS FlashcardSet (
	id SERIAL,
	user_id INT,
	quizlet_set_id BIGINT,
	name varchar(256),
	terms_language INT DEFAULT 0,
	definitions_language INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Flashcard (
	id SERIAL,
	flashcard_set_id INT,
	term varchar(4096),
	definition varchar(4096),
	term_image_url varchar(512),
	definition_image_url varchar(512),
	learned BOOLEAN DEFAULT FALSE,
	position INT DEFAULT 0
);
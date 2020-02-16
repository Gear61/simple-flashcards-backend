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
	id varchar(64),
	user_id INT,
	quizlet_set_id BIGINT,
	name varchar(256),
	terms_language INT DEFAULT 0,
	definitions_language INT DEFAULT 0
);

ALTER TABLE FlashcardSet ADD original_set_id varchar(64);

CREATE TABLE IF NOT EXISTS Flashcard (
	id varchar(64),
	flashcard_set_id varchar(64),
	term varchar(4096),
	definition varchar(4096),
	term_image_url varchar(512),
	definition_image_url varchar(512),
	learned BOOLEAN DEFAULT FALSE,
	position INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Folder (
	id varchar(64),
	user_id INT,
	name varchar(256)
);

CREATE TABLE IF NOT EXISTS FlashcardSetInFolder (
	flashcard_set_id varchar(64),
	folder_id varchar(64)
);
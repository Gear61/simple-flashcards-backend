-- Let the db update updated_at
-- https://x-team.com/blog/automatic-timestamps-with-postgresql/

-- Moved function to add_timestamp.sql
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

ALTER TABLE FlashcardSet ADD COLUMN IF NOT EXISTS original_set_id varchar(64);
ALTER TABLE FlashcardSet ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE FlashcardSet ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE FlashcardSet ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

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

ALTER TABLE Flashcard ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE Flashcard ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE Flashcard ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS Folder (
	id varchar(64),
	user_id INT,
	name varchar(256)
);

ALTER TABLE Folder ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE Folder ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE Folder ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();


CREATE TABLE IF NOT EXISTS FlashcardSetInFolder (
	flashcard_set_id varchar(64),
	folder_id varchar(64)
);

ALTER TABLE FlashcardSetInFolder ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE FlashcardSetInFolder ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE FlashcardSetInFolder ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Let the db update updated_at
-- https://x-team.com/blog/automatic-timestamps-with-postgresql/

START TRANSACTION

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
ALTER TABLE FlashcardSet ADD deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE FlashcardSet ADD created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE FlashcardSet ADD updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- There is no create trigger if not exists. Recommended is to in a transaction drop and then add
DROP TRIGGER set_timestamp IF EXISTS ON FlashcardSet;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON FlashcardSet
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

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

ALTER TABLE Flashcard ADD deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE Flashcard ADD created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE Flashcard ADD updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
DROP TRIGGER set_timestamp IF EXISTS ON Flashcard;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON Flashcard
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS Folder (
	id varchar(64),
	user_id INT,
	name varchar(256)
);

ALTER TABLE Folder ADD deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE Folder ADD created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE Folder ADD updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
DROP TRIGGER set_timestamp IF EXISTS ON Folder;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON Folder
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE IF NOT EXISTS FlashcardSetInFolder (
	flashcard_set_id varchar(64),
	folder_id varchar(64)
);

ALTER TABLE FlashcardSetInFolder ADD deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE FlashcardSetInFolder ADD created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE FlashcardSetInFolder ADD updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
DROP TRIGGER set_timestamp IF EXISTS ON FlashcardSetInFolder;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON FlashcardSetInFolder
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

COMMIT
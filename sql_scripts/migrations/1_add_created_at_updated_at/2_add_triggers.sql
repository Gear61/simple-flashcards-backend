-- There is no create trigger if not exists. Recommended is to drop trigger then add
DROP TRIGGER IF EXISTS set_timestamp ON FlashcardSet;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON FlashcardSet
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON FlashcardSetInFolder;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON FlashcardSetInFolder
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON Folder;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON Folder
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON Flashcard;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON Flashcard
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
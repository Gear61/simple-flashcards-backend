DROP TRIGGER IF EXISTS new_flashcardset_timestamp ON Flashcard;
DROP TRIGGER IF EXISTS delete_flashcardset_timestamp ON Flashcard;
CREATE TRIGGER new_flashcardset_timestamp
AFTER INSERT OR UPDATE ON Flashcard
FOR EACH ROW
EXECUTE PROCEDURE new_sync_flashcardset_timestamp();
CREATE TRIGGER delete_flashcardset_timestamp
BEFORE DELETE ON Flashcard
FOR EACH ROW
EXECUTE PROCEDURE old_sync_flashcardset_timestamp();
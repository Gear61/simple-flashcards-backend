DROP FUNCTION IF EXISTS new_sync_flashcardset_timestamp() CASCADE;
DROP FUNCTION IF EXISTS old_sync_flashcardset_timestamp() CASCADE;

CREATE FUNCTION new_sync_flashcardset_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE FlashcardSet SET updated_at = NOW() WHERE id = NEW.flashcard_set_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION old_sync_flashcardset_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE FlashcardSet SET updated_at = NOW() WHERE id = OLD.flashcard_set_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

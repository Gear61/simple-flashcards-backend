CREATE INDEX IF NOT EXISTS flashcard_index_on_flashcard_set_id ON Flashcard (flashcard_set_id);
CREATE INDEX IF NOT EXISTS flashcard_set_index_on_user_id ON FlashcardSet (user_id);
/* eslint-disable quotes */
const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id });
  },

  getLanguageHead(db, language_id) {
    return db
      .from("language")
      .select(
        "word.original",
        "language.total_score",
        "word.correct_count",
        "word.incorrect_count"
      )
      .join("word", "word.id", "=", "language.head")
      .where("language.id", language_id);
  },

  updateLanguageHeadAndScore(db, language_id, head, total_score) {
    return db
      .from("language")
      .where("language.id", language_id)
      .update({ head, total_score });
  },

  updateTotalScore(db, language_id, score) {
    return db
      .from("language")
      .where("language.id", language_id)
      .update({ score });
  },

  getNext(db, next) {
    return db
      .from("word")
      .select("original")
      .where("id", next)
      .first();
  },
  updateNext(db, id, next) {
    return db
      .from("word")
      .where("id", id)
      .update({ next });
  },
  checkGuess(db, id) {
    return db
      .from("word")
      .select("*")
      .where("id", id)
      .first();
  },

  increaseHeadMemValue(db, language_id) {
    const word = db
      .from("word")
      .select("word.id", "word.memory_value")
      .leftJoin("language", "language.head", "=", "word.id")
      .where("language.id", language_id);

    const newMemoryValue = word.memory_value * 2;

    db("word")
      .where("word.id", "=", word.id)
      .update({
        memory_value: newMemoryValue
      });

    return newMemoryValue;
  },

  resetHeadMemValue(db, language_id) {
    const id = db
      .from("word")
      .select("word.id")
      .leftJoin("language", "language.head", "=", "word.id")
      .where("language.id", language_id);

    db("word")
      .where("word.id", id)
      .update({
        memory_value: 1
      });

    return 1;
  },

  shiftWord(db, language_id, int) {
    const head = db
      .from("word")
      .select("word.id", "word.next")
      .leftJoin("language", "language.head", "=", "word.id")
      .where("language.id", "=", language_id);

    db("language")
      .where("language.id", "=", language_id)
      .update({
        head: int
      });
  }
};

module.exports = LanguageService;

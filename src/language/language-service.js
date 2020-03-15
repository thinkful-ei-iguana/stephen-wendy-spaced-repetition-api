/* eslint-disable quotes */
const LinkedList = require("./LL");

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
        "word.translation",
        "language.total_score",
        "word.correct_count",
        "word.incorrect_count",
        "word.next"
      )
      .join("word", "word.id", "=", "language.head")
      .where("language.id", language_id);
  },

  createLinkedList: async (db, head) => {
    const wordList = new LinkedList();
    const [firstWord] = await LanguageService.getWord(db, head);

    wordList.insertFirst(firstWord);

    let [currentWord] = await LanguageService.getWord(db, firstWord.next);

    while (currentWord) {
      wordList.insertLast(currentWord);
      [currentWord] = await LanguageService.getWord(db, currentWord.next);
    }

    return wordList;
  },

  correctAnswer(db, memory_value, id) {
    return db
      .from("word")
      .where("id", id)
      .increment("memory_value", memory_value)
      .increment("correct_count", 1)
      .returning([
        "next",
        "correct_count",
        "incorrect_count",
        "translation",
        "memory_value"
      ]);
  },

  getWord(db, id) {
    return db
      .from("word")
      .select("*")
      .where("id", id);
  },

  updateTotal(db, language_id) {
    return db
      .from("language")
      .where("id", language_id)
      .increment("total_score", 1)
      .returning("total_score");
  },

  moveHead(db, language_id, next) {
    return db
      .from("language")
      .where("id", language_id)
      .update("head", next);
  },

  shiftWord: async (db, language_id, memory_value, list, word_id) => {
    let nodeBefore = list.head;

    let wordsArr = await LanguageService.getLanguageWords(db, language_id);
    let length = wordsArr.length;

    await LanguageService.moveHead(db, language_id, nodeBefore.value.next);

    if (memory_value > length - 1) {
      while (nodeBefore.next) {
        nodeBefore = nodeBefore.next;
      }
      await LanguageService.changeNexts(db, nodebefore.value.id, word_id);
      await LanguageService.changeNexts(db, word_id, null);

      return;
    }

    for (let i = 0; i <= memory_value; i++) {
      nodeBefore = nodeBefore.next;
    }
    let nextId = nodeBefore.next.value.id;
    await LanguageService.changeNexts(db, nodeBefore.value.id, word_id);
    await LanguageService.changeNexts(db, word_id, nextId);
    return;
  },

  changeNexts(db, word_id, next_id) {
    return db
      .from("word")
      .where("id", word_id)
      .update("next", next_id);
  },

  incorrectAnswer(db, word_id) {
    return db
      .from("word")
      .where("id", word_id)
      .update("memory_value", 1)
      .increment("incorrect_count", 1)
      .returning(["next", "translation", "memory_value", "incorrect_count"]);
  },

  getTotal(db, language_id) {
    return db
      .from("language")
      .select("total_score")
      .where("id", language_id);
  }
};

module.exports = LanguageService;

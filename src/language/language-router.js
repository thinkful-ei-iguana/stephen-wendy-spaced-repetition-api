const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const LinkedList = require("./LL");

const languageRouter = express.Router();
const jsonBodyParser = express.json();

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`
      });

    req.language = language;

    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.use(requireAuth).get("/", async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );

    res.json({
      language: req.language,
      words
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get("/head", async (req, res, next) => {
  try {
    const [head] = await LanguageService.getLanguageHead(
      req.app.get("db"),
      req.language.id
    );

    res.json({
      nextWord: head.original,
      totalScore: head.total_score,
      wordCorrectCount: head.correct_count,
      wordIncorrectCount: head.incorrect_count
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.post("/guess", jsonBodyParser, async (req, res, next) => {
  const { guess } = req.body;

  if (!guess) {
    return res.status(400).json({
      error: `Missing 'guess' in request body`
    });
  }

  const wordList = await LanguageService.createLinkedList(
    req.app.get("db"),
    req.language.head
  );

  let { translation, memory_value, id } = wordList.head.value;

  if (guess === translation) {
    try {
      let [correctAnswer] = await LanguageService.correctAnswer(
        req.app.get("db"),
        memory_value,
        id
      );

      let [nextWord] = await LanguageService.getWord(
        req.app.get("db"),
        wordList.head.value.next
      );

      //total Score in lang table
      let [total] = await LanguageService.updateTotal(
        req.app.get("db"),
        req.language.id
      );

      await LanguageService.shiftWord(
        req.app.get("db"),
        req.language.id,
        memory_value,
        wordList,
        id
      );

      let correctRes = {
        nextWord: wordList.head.next.value.original,
        wordCorrectCount: nextWord.correct_count,
        wordIncorrectCount: nextWord.incorrect_count,
        totalScore: total,
        answer: correctAnswer.translation,
        isCorrect: true
      };

      res.send(correctRes);
    } catch (error) {
      next(error);
    }
  } else {
    try {
      let [incorrectAnswer] = await LanguageService.incorrectAnswer(
        req.app.get("db"),
        id
      );

      let [nextWord] = await LanguageService.getWord(
        req.app.get("db"),
        wordList.head.value.next
      );

      await LanguageService.shiftWord(
        req.app.get("db"),
        req.language.id,
        0,
        wordList,
        id
      );

      let [total] = await LanguageService.getTotal(
        req.app.get("db"),
        req.language.id
      );

      let incorrectRes = {
        nextWord: wordList.head.next.value.original,
        wordCorrectCount: nextWord.correct_count,
        wordIncorrectCount: wordList.head.next.value.incorrect_count,
        totalScore: total.total_score,
        answer: incorrectAnswer.translation,
        isCorrect: false
      };
      res.send(incorrectRes);
    } catch (error) {
      next(error);
    }
  }
});

module.exports = languageRouter;

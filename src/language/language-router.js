const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");

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
    console.log(req.language.head);
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

languageRouter
  .use(checkTranslation)
  .post("/guess", jsonBodyParser, async (req, res, next) => {
    const { guess } = req.body;
    console.log("head id", req.language.head);

    let nextHead = req.language.head;
    let newMemory = 0;
    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let response = {};
    if (!guess) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`
      });
    }
    LanguageService.updateLanguageHead(
      req.app.get("db"),
      req.language.id,
      nextHead
    )
      .then(rows => {
        res.status(200).end();
      })
      .catch(next);
    const [head] = await LanguageService.getLanguageHead(
      req.app.get("db"),
      req.language.id
    );

    if (guess === res.guess.translation) {
      nextHead = nextHead + 1;
      totalScore = totalScore + 1;
      correctCount = correctCount + 1;

      return res.status(200).json({
        totalScore: totalScore,
        wordCorrectCount: correctCount,
        wordIncorrectCount: incorrectCount,
        answer: res.guess.translation,
        isCorrect: true
      });
    } else {
      return res.status(200).json({
        nextWord: head.original,
        totalScore: head.total_score,
        wordCorrectCount: head.correct_count,
        wordIncorrectCount: head.incorrect_count,
        answer: res.guess.translation,
        isCorrect: false
      });
    }
    // const isCorrect = await LanguageService.checkGuess(
    //   req.app.get("db"),
    //   req.language,
    //   guess
    // );

    // if (isCorrect) {
    //   newMemory = await LanguageService.increaseHeadMemValue(
    //     req.app.get("db"),
    //     req.language.id
    //   );

    //   totalScore = await LanguageService.updateTotalScore(
    //     req.app.get("db"),
    //     req.language.id
    //   );

    //   moveHead = await LanguageService.shiftWord(
    //     req.app.get("db"),
    //     req.language.id,
    //     totalScore
    //   );
    // }

    //if correct guess, update mem val, update total score, move head
  });

async function checkTranslation(req, res, next) {
  try {
    const guess = await LanguageService.checkGuess(
      req.app.get("db"),
      req.language.head
    );

    if (!guess) return res.status(404).json({ error: "Incorrect guess" });
    res.guess = guess;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = languageRouter;

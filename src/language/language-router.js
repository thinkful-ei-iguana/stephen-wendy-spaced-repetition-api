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

  //checks the translation of the current word
  .use(checkTranslation)

  //move the head by one whether correct or incorrect

  .post("/guess", jsonBodyParser, async (req, res, next) => {
    const { guess } = req.body;

    let totalScore = req.language.total_score;

    console.log(req.language);
    if (!guess) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`
      });
    }

    //need to account for NULL nextHead
    const [head] = await LanguageService.getLanguageHead(
      req.app.get("db"),
      req.language.id
    );

    console.log("head in req", req.language.head);

    const [currentWord] = await LanguageService.getCurrentWord(
      req.app.get("db"),
      req.language.id,
      req.language.head
    );

    console.log("currentWord", currentWord);

    const [nextWord] = await LanguageService.getNextWord(
      req.app.get("db"),
      req.language.id,
      head.next
    );

    console.log("nextWord", nextWord);

    //don't need the below, have access through get Head
    const [wordScore] = await LanguageService.getTotalWordScore(
      req.app.get("db"),
      req.language.id,
      req.language.head
    );

    let lastCorrect = wordScore.correct_count;
    console.log("initial lastCorrect", lastCorrect);
    let lastIncorrect = wordScore.incorrect_count;
    console.log("initial lastIncorrect", lastIncorrect);
    console.log("wordScore", wordScore);
    let currentWordNext = currentWord.next;
    console.log("currentWordNext", currentWordNext);

    if (guess === res.guess.translation) {
      totalScore = totalScore + 1;
      lastCorrect = lastCorrect + 1;
      lastIncorrect;
      currentWordNext = currentWordNext + 2;

      await LanguageService.updateLanguageHeadAndScore(
        req.app.get("db"),
        req.language.id,
        head.next,
        totalScore
      );

      console.log("lastCorrect", lastCorrect);
      console.log("wordScore.id", wordScore.id);
      LanguageService.updateCorrectScoreAndPosition(
        req.app.get("db"),
        wordScore.id,
        lastCorrect,
        currentWordNext
      )
        .then(rows => {
          res.status(200).json({
            nextWord: nextWord.original,
            totalScore: totalScore,
            wordCorrectCount: lastCorrect,
            wordIncorrectCount: lastIncorrect,
            answer: wordScore.translation,
            isCorrect: true
          });
        })
        .catch(next);
    } else {
      lastCorrect = lastCorrect;
      lastIncorrect = lastIncorrect + 1;
      currentWordNext = currentWordNext - 1;

      console.log("nextWord", nextWord);
      LanguageService.updateIncorrectScoreAndPosition(
        req.app.get("db"),
        wordScore.id,
        lastIncorrect,
        currentWordNext
      )
        .then(rows => {
          res.status(200).json({
            nextWord: head.original,
            totalScore: totalScore,
            wordCorrectCount: lastCorrect,
            wordIncorrectCount: lastIncorrect,
            answer: head.translation,
            isCorrect: false
          });
        })
        .catch(next);
    }
  });

async function checkTranslation(req, res, next) {
  try {
    const guess = await LanguageService.checkGuess(
      req.app.get("db"),
      req.language.head
    );

    res.guess = guess;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = languageRouter;

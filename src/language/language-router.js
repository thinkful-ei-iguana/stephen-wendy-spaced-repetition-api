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
  // .use(moveHead)
  .post("/guess", jsonBodyParser, async (req, res, next) => {
    const { guess } = req.body;
    //service updates the head and score (language table)
    let currHead = req.language.head;

    let totalScore = req.language.total_score;
    //update the count - should persist

    let correctCount = 0;
    let incorrectCount = 0;

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

    const [nextWord] = await LanguageService.getNextWord(
      req.app.get("db"),
      req.language.id,
      head.next
    );

    if (guess === res.guess.translation) {
      totalScore = totalScore + 1;
      // correctCount = correctCount + 1;
      //next head should be the next word id
      LanguageService.updateLanguageHeadAndScore(
        req.app.get("db"),
        req.language.id,
        head.next,
        totalScore
      )
        .then(rows => {
          res.status(200).json({
            nextWord: nextWord.original,
            totalScore: totalScore,
            wordCorrectCount: correctCount,
            wordIncorrectCount: incorrectCount,
            answer: head.translation,
            isCorrect: true
          });
        })
        .catch(next);
    } else {
      // nextHead = nextHead + 1;
      // incorrectCount = incorrectCount + 1;

      return res.status(200).json({
        nextWord: nextWord.original,
        totalScore: totalScore,
        wordCorrectCount: correctCount,
        wordIncorrectCount: incorrectCount,
        answer: head.translation,
        isCorrect: false
      });
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

async function moveHead(req, res, next) {
  try {
    const guess = await LanguageService.updateLanguageHead(
      req.app.get("db"),
      res.guess.next,
      res.guess.next
    );
    res.guess = guess;
    let test = guess;

    next();
  } catch (error) {
    next(error);
  }
}
module.exports = languageRouter;

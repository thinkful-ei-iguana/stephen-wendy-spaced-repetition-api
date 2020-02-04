const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language) 
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .use(requireAuth)
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .use(requireAuth)
  .get('/head', async (req, res, next) => {
    try {
      const word = await LanguageService.getNextWord(
        req.app.get('db'),
        req.language.id
      )
      
      res.json({
        nextWord: word.original,
        totalScore: word.total_score,
        wordCorrectCount: word.correct_count,
        wordIncorrectCount: word.incorrect_count,
      })
    } catch (error){
      next(error)
    }
  })

languageRouter
  .use(requireAuth)
  .post('/guess', async (req, res, next) => {
    
    if (!req.body.guess) {
      return res
        .status(400)
        .json({
          error: `Error missing 'guess' in request body`
        })
    }
    res.send('implement me!')
  })

module.exports = languageRouter

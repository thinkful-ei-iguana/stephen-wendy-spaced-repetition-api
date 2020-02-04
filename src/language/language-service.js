const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getNextWord(db, id) {
    return db
      .from('word')
      .select(
        'word.id',
        'word.original',
        'language.total_score',
        'word.correct_count',
        'word.incorrect_count',
      )
      .join(
        'language',
        'language.id',
        '=',
        'word.language_id',
      )
      .where('word.id', id)
      .first();
  }
}

module.exports = LanguageService

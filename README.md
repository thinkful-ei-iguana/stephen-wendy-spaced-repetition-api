# Spaced Box API

  This API handles all data for the Spaced Box language learning app. The database stores users data and the progression through the learning process.

[Client Repo](https://github.com/thinkful-ei-iguana/stephen-wendy-spaced-repetition/tree/4788d03b66a3f731cf6d878f0e1930f970dcf09e)

**API URL:**

  https://vast-headland-68467.herokuapp.com/api

**Tech Stack:** Node, Express, Knex, PostgreSQL, Mocha & Chai

## **Create User**

  This route is responsible for storing a new user's data in the database.

* **URL**

  /user

* **Method**

  `POST`

* **Data Patams**

  A successful post request to this endpoint requires a users name, username, and password in the request body.

  **Required**

  `name: 'string'` <br />
  `username: 'string'` <br />
  `password: 'string'`

* **Success Response**

  * **Code:** 201 CREATED <br />
    **Header:** Location: /user/:user_id <br />
    **Content:**
    ```javascript
    {
      id: 102,
      name: 'John Smith',
      username: 'JSmith1631'
    }
    ```

* **Error Response**

  Failing to include the appropriate data in the request body will result in an error response.

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: 'Missing {field} in request body }`

    OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: 'Password must {requirement}' }`

    OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: 'Username already taken' }`

* **Sample Call**

  ```javascript
  fetch(`${API_URL}/user`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      name: 'John Smith',
      username: 'JSmith1631',
      password: 'l0ngb0atR!des'
    })
  })
  ```

## **User Authorization**

  The authorization route is responsible for generating a JavaScript Web Token (JWT) upon a user login. The JWT is used for accessing protected endpoints.

* **URL**

  /auth

* **Method**

  `POST` | `PUT`

* **Data Params**

  A post request to this endpoint requires a user's username and password.

  **Required**

    `username: 'string'` <br />
    `password: 'string'`

* **Success Response**

  * **Code:** 200 SUCCESS <br />
    **Content:** `{ authToken: {JWT} }`

* **Error Response**

  Failing to include the appropriate data in the request body will result in an error response.

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: 'Missing {field} in request body' }`

    OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: 'Incorrect username or password' }`

* **Sample Call**

  ```javascript
  fetch(`${API_URL}/auth`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username: 'JSmith1631',
      password: 'l0ngb0atR!des'
    })
  })
  ```

## **User's Language**

  The language route is responsible for retrieving a user's current word, a list of user's words with progress, and handling a users guess translation.

* **URL**

  /language <br />
  /language/head <br />
  /language/guess

* **Method**

  `GET` | `POST`

* **Data Params**

  This is a protected endpoint and requires a JWT authorization header to access. The guess endpoint requires a guess in the request body.

  **Required**

  `authorization: 'string'` <br>
  `guess: 'string'`

* **Success Response**

  * GET /language

    * **Code:** 200 SUCCESS <br />
      **Content:**
      ```javascript
      {
        language: {
          id: 1,
          name: 'Hungarian',
          user_id: 120,
          head: 4,
          total_score: 600
        },
        words: [
          {
            id: 1,
            language_id: 1,
            original: 'fejleszto',
            translation: 'developer',
            next: 2,
            memory_value: 8,
            correct_count: 3,
            incorrect_count: 8
          },
          {...},
          {...}
        ]
      }
      ```

  * GET /language/head

    * **Code:** 200 SUCCESS
      **Content:**
      ```javascript
      {
        nextWord: 'fejleszto',
        totalScore: 200,
        wordCorrectCount: 12,
        wordIncorrectCount: 15
      }
      ```

  * POST /language/guess

    * **Code:** 200 SUCCESS
      **Content:**
      ```javascript
      {
        nextWord: 'szoftver',
        wordCorrectCount: 35,
        wordIncorrectCount: 49,
        totalScore: 592,
        answer: 'developer',
        isCorrect: true
      }
      ```

* **Error Respone**

  * /language

    This is a protected route and requires the use of a JWT in order to access. If the user does not have a language in the database the route will respond with an error.

    * **Code:** 404 NOT FOUND <br />
      **Content:** `{ error: 'You don't have any languages' }`

      OR

    * **Code:** 401 UNAUTHORIZED <br />
      **Content:** `{ error: 'Missing bearer token' }`

      OR

    * **Code:** 401 UNAUTHORIZED <br />
      **Content:** `{ error: 'Unauthorized request' }`

  * POST /language/guess

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error: 'Missing 'guess' in request body' }`

* **Sample Call**

  * GET /language

    ```javascript
    fetch(`${API_URL}/language`, {
      headers: {
        'authorization': `bearer {JWT}`
      }
    })
    ```

  * GET /language/head

    ```javascript
    fetch(`${API_URL}/language/head`, {
      headers: {
        'authorization': `bearer {JWT}`
      }
    })
    ```

  * POST /language/guess

    ```javascript
    fetch(`${API_URL}/language/guess`, {
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer {JWT}`
      },
      body: JSON.stringify({
        guess: 'developer'
      })
    })
    ```

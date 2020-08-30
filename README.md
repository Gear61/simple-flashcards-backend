## Running Locally
The API will start listening at http://localhost:5000.
```
npm run dev
```

## Access The Database
```
heroku pg:psql -a simple-flashcards-backend
```

## Run .sql Script From Within Postgres CLI
```
\i path_to_your_sql_here
```

## View The Logs (On Production)
```
heroku logs --tail
```

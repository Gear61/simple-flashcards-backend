## Running Locally
The API will start listening at http://localhost:5000.
```
heroku local web
```

## Access The Database

#### Connect to production database
```
heroku pg:psql
```

#### Connect to dev (free 10,000 rows version) database
```
heroku pg:psql postgresql-corrugated-32743 --app simple-flashcards-backend
```

## Run .sql Script From Within Postgres CLI
```
\i path_to_your_sql_here
```

## View The Logs (On Production)
```
heroku logs --tail
```

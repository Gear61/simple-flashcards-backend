## Running Locally
First, make sure all dependencies are up to date:
```
npm install
```
Now you can run the server on your localhost. The API will start listening at http://localhost:5000.
```
npm run dev
```
Any file changes will automatically be hot reloaded. To avoid watching certain files, update nodemon.json.

## Access The Database

#### Connect to production database
```
heroku pg:psql --app simple-flashcards-backend
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

## Running Locally
The API will start listening at http://localhost:5000.
```
heroku local web
```

## Access The Database
```
heroku pg:psql
```

## Run .sql Script From Within Postgres CLI
```
\i path_to_your_sql_here
```

## View The Logs (On Production)
```
heroku logs --tail
```

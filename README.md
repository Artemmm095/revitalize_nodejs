### Work with db
[Knex documentation](https://knexjs.org/guide/)

Create a new migration:
`npx knex migrate:make <table_name>`

Run all migrations:
`knex migrate:up`

Rollback the last migration:
`knex migrate:down`

Running Migrations on different environments
- Development: `knex migrate:latest --env development`
- Test: `knex migrate:latest --env test`
- Production: `knex migrate:latest --env production`

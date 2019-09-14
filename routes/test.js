const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

module.exports = function(app) {
	app.get('/db', async (request, response) => {
		try {
			const client = await pool.connect();
			const result = await client.query('SELECT * FROM Account');
			const results = { 'results': (result) ? result.rows : null};
			response.send(results);
			client.release();
		} catch (err) {
			console.error(err);
			res.send("Error " + err);
		}
	});
}

/* eslint-disable no-console, no-process-exit */
const imdb = require('./src/imdb');
const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const DENZEL_IMDB_ID = 'nm0000243';
const uri = "mongodb+srv://main:user23@cluster0-uzahy.azure.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });

async function sandbox (actor) {
	try {
		console.log(`📽️  fetching filmography of ${actor}...`);
		const movies = await imdb(actor);
		const awesome = movies.filter(movie => movie.metascore >= 77);

		console.log(`🍿 ${movies.length} movies found.`);
		console.log(JSON.stringify(movies, null, 2));
		console.log(`🥇 ${awesome.length} awesome movies found.`);
		console.log(JSON.stringify(awesome, null, 2));
		process.exit(0);
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
}

async function main()
{
	const movies = await imdb(DENZEL_IMDB_ID);
	const dbName = 'movies';

	client.connect(function(err, client) {
		assert.equal(null, err);
		console.log("Connected correctly to server");

		const db = client.db(dbName);

		db.collection("films").insertMany(movies, null, function (error, results) {
			if (error) throw error;

			console.log("Le document a bien été inséré"); 

			client.close();

		});
	});

}

async function test(actor){
	const movies = await imdb(actor);
	//console.log(movies);
	console.log(JSON.stringify(movies, null, 2));
}

//test(DENZEL_IMDB_ID);
//sandbox(DENZEL_IMDB_ID);
main();

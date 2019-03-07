const imdb = require('./src/imdb');
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const uri = "mongodb+srv://main:user23@cluster0-uzahy.azure.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "movies";
const DENZEL_IMDB_ID = 'nm0000243';

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(9292, () => {
    MongoClient.connect(uri, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("denzel");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

app.post("/movies/populate", (request, response) => {
	(async () => {
		var movies = await imdb(DENZEL_IMDB_ID);
		collection.insertMany(movies, (error, result) => {
	        if(error) {
	            return response.status(500).send(error);
	        }
	        response.send(result.result);
    	});
    	console.log("Database successfully populated.");
	})();
});

app.get("/movies", (request, response) => {
	collection.aggregate([{ $match: { "metascore": {$gt:70}}}, { $sample: { size: 1 }}]).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
    console.log("Query successfull.");
});
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

app.post("/movies/populate", async (request, response) => {
	var movies = await imdb(DENZEL_IMDB_ID);
	collection.insertMany(movies, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
	});
	console.log("Database successfully populated.");
});

app.get("/movies", (request, response) => {
	collection.aggregate([{ $match: { "metascore": {$gt:70}}}, { $sample: { size: 1 }}]).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
    console.log("Query done.");
});

app.get("/movies/id/:id", (request, response) => {
	collection.findOne({ "id": request.params.id}, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
    console.log("Query done.");
});

app.get("/movies/search", (request, response) => {
	var limit = 5, metascore = 0;
	if(request.query.limit != undefined) limit = request.query.limit;
	if(request.query.metascore != undefined) metascore = request.query.metascore;
	collection.aggregate([{$match:{"metascore": {$gte:Number(metascore)}}}, {$limit:Number(limit)}]).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
    console.log("Search done.");
});

app.post("/movies/id/:id", (request, response) => {
	collection.updateOne({"id": request.params.id}, {$set: {"date":request.query.date, "review":request.query.review}}, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
    console.log("Update done.");
});
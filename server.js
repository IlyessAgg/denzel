const imdb = require('./src/imdb');
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const graphqlHTTP = require('express-graphql');
const {GraphQLSchema} = require('graphql');
const {makeExecutableSchema} = require('graphql-tools');

const uri = "mongodb+srv://main:user23@cluster0-uzahy.azure.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "movies";
const DENZEL_IMDB_ID = 'nm0000243';
const port = 9292;

var app = Express();
var database, collection;

async function main(){

    try {

        var movies = await imdb(DENZEL_IMDB_ID);

        MongoClient.connect(uri, { useNewUrlParser: true }, (error, client) => {
                if(error) throw error;
                database = client.db(DATABASE_NAME);
                collection = database.collection("denzel");
        });

        const typeDefs = [`
          type Query {
            movies: Int
            movie(id: String): Movie
          }
          type Movie {
            link: String
            metascore: Int
            synopsis: String
            title: String
            year: Int
          }
          schema {
            query: Query
          }
        `];

        const resolvers = {
          Query: {
            movies: async () => {
                const res = await collection.insertMany(movies)
                console.log(res.insertedCount)
                return res.insertedCount
            },
            movie: async (root, {id}) => {
              return await collection.findOne({ "id": id})
            },
          },
        }

        const schema = makeExecutableSchema({
          typeDefs,
          resolvers
        })

        app.use('/graphql', graphqlHTTP({
            schema: schema,
            graphiql: true,
        }));

        app.listen(port, () => {
            console.log("Connected !");
        });

    } catch (e) {
    console.log(e);
  }

}


main();
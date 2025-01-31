import { MongoClient } from "mongodb";

const uri = "mongodb://0.0.0.0:27017";

const client = new MongoClient(uri);
let _db;

export const clientConnect = async (callback) => {
    return await client
        .connect()
        .then((mongoClient) => {
            console.log("Connected to MongoDB.");
            _db = mongoClient.db("express_shop");
            callback(mongoClient);
            return mongoClient;
        })
        .catch((err) => {
            throw new Error(err);
        });
};

export const getDb = () => {
    if (_db) {
        return _db;
    }
    throw new Error("No database found!");
};

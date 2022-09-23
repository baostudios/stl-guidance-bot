require("dotenv").config();

const log = require("../assets/utils/logger");

const { MongoClient, ServerApiVersion } = require("mongodb");
const { MONGO } = process.env;

module.exports = () => {
    const db = new MongoClient(MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1,
    });
    db.connect().catch(
        console.error);

    /**
     * Executes a collection method passed as a callback
     * @param {String} databaseQuery The name of the database queried
     * @param {String} collectionQuery The name of the collection queried
     * @param {Function} callback The method used upon the collection
     */
    db.execute = async (databaseQuery, collectionQuery, callback) => {
        // the whole point of this function really is to mitigate the repetitiveness of
        // initializing a new mongo client every time we need to make a query or update the database
        // using a helper like this makes life easier
        try {
            await db.db(databaseQuery).createCollection(collectionQuery);
        } catch (e) {
            log.debug(e);
        }

        return await callback(db.db(databaseQuery).collection(collectionQuery));
    };
    return db;
};
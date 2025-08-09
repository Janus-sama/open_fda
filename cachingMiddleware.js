const dotenv = require("dotenv");
dotenv.config();

const redis = require("node-redis");

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

client.connect();


const client = require("./redis-client");
const checkCache = (cacheKey) => async (req, res, next) => {
    try {
        const cachedData = await client.get(cacheKey(req));
        if (cachedData) {
            console.log("Cache hit!");
            return res.json(JSON.parse(cachedData));
        }
        console.log("Cache miss!");
        next();
    } catch (error) {
        console.error("Redis cache error:", error);
        next();
    }
};

module.exports = checkCache;
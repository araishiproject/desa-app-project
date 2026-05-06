const redis = require("redis");

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379"
    });
    
    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    
    await redisClient.connect();
    console.log("✅ Redis connected");
    
    return redisClient;
  } catch (error) {
    console.error("❌ Redis connection failed:", error.message);
    // Continue without Redis if it fails
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient
};

const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 20) {
            console.log('Too many attempts to reconnect. Redis connection terminated');
            return new Error('Too many retries.');
          } else {
            return retries * 500;
          }
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    return null;
  }
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };
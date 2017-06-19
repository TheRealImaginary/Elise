const winston = require('winston');
const redis = require('redis');
const { promisifyAll } = require('bluebird');

promisifyAll(redis.RedisClient.prototype);
promisifyAll(redis.Multi.prototype);

const { REDIS_HOST, REDIS_PORT } = process.env;

const client = redis.createClient({ host: REDIS_HOST, port: REDIS_PORT });

module.exports = class Redis {

  static get client() {
    return client;
  }

  static connect() {
    client.on('error', err => winston.error('[REDIS]: Error connecting to Redis', err));
    client.on('reconnecting', meta => winston.warn('[REDIS]: Reconnecting to Redis', meta));
    client.on('ready', () => '[REDIS]: Connect to Redis Server');
  }
};

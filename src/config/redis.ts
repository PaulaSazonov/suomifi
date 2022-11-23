import redis from 'redis'
import { promisify } from 'util'
import { createClient } from 'redis'
import { REDIS_HOST, REDIS_PW } from './dotenv'

const redisConfig = { host: REDIS_HOST, password: REDIS_PW }

const client = createClient(redisConfig)

client.on('error', console.error)

client.connect().then(() => console.log('Connected to Redis'))

export default client

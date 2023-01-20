import envalid from 'envalid'
import dotenv from 'dotenv'

const options = { strict: true }
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: 'test/test.env' })
} else {
  dotenv.config()
}

const vars = envalid.cleanEnv(
  process.env,
  {
    PORT: envalid.port({ default: 3000 }),
    LOG_LEVEL: envalid.str({
      default: 'info',
      devDefault: 'debug',
      choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    }),
    KAFKA_LOG_LEVEL: envalid.str({
      default: 'nothing',
      choices: ['debug', 'info', 'warn', 'error', 'nothing'],
    }),
    KAFKA_BROKERS: envalid.makeValidator((input) => {
      const kafkaSet = new Set(input === '' ? [] : input.split(','))
      if (kafkaSet.size === 0) throw new Error('At least one kafka broker must be configured')
      return [...kafkaSet]
    })({ default: ['localhost:9092'] }),
    KAFKA_READINGS_TOPIC: envalid.str({ default: 'readings' }),
    KAFKA_EVENTS_TOPIC: envalid.str({ default: 'events' }),
    KAFKA_PAYLOAD_ROUTING_PREFIX: envalid.str({ default: 'payloads' }),
  },
  options
)

export default vars

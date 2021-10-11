const pino = require('pino')
const env = require('./env')

const mkLogger = (sensorType) => {
  const logger = pino(
    {
      name: `${sensorType || 'GENERIC_PAYLOAD_PROCESSOR'}_PAYLOAD_PROCESSOR`,
      level: env.LOG_LEVEL,
    },
    process.stdout
  )

  logger.debug('Environment variables: %j', { ...env })

  return logger
}

module.exports = mkLogger

import pino from 'pino'
import env from './env.js'

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

export default mkLogger

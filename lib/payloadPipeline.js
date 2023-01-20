import { Kafka, logLevel as kafkaLogLevels } from 'kafkajs'

import env from './env.js'

const { KAFKA_BROKERS, KAFKA_LOG_LEVEL, KAFKA_READINGS_TOPIC, KAFKA_EVENTS_TOPIC, KAFKA_PAYLOAD_ROUTING_PREFIX } = env

const mkPayloadPipeline = async ({ logger, sensorType, payloadProcessor: mkPP }) => {
  const KAFKA_PAYLOAD_TOPIC = `${KAFKA_PAYLOAD_ROUTING_PREFIX}.${sensorType}`

  const payloadProcessor = mkPP({ logger })

  const kafkaLogger = logger.child({ module: 'Kafka' })
  const logCreator = () => ({ label, log }) => {
    const { message } = log
    kafkaLogger[label.toLowerCase()]({
      message,
    })
  }

  const kafka = new Kafka({
    clientId: `${sensorType}-payload-processor`,
    brokers: KAFKA_BROKERS,
    logLevel: kafkaLogLevels[KAFKA_LOG_LEVEL.toUpperCase()],
    logCreator,
  })
  const producer = kafka.producer()
  await producer.connect()

  const consumer = kafka.consumer({ groupId: `${sensorType}-payload-processor` })
  await consumer.connect()
  await consumer.subscribe({ topic: KAFKA_PAYLOAD_TOPIC, fromBeginning: true })

  const forwardMessages = async (topic, key, readingsOrEvents) => {
    if (readingsOrEvents && readingsOrEvents.length !== 0) {
      const readingMessages = readingsOrEvents.map((r) => ({
        key,
        value: JSON.stringify(r),
      }))

      logger.trace(`Publishing to topic %s messages %j`, topic, readingsOrEvents)
      await producer.send({
        topic,
        messages: readingMessages,
      })
    }
  }

  //  TODO: work out correct behaviour here
  await consumer
    .run({
      eachMessage: async ({ message: { key, value } }) => {
        try {
          logger.debug(`Raw payload received`)
          logger.trace(`Payload is ${value.toString('utf8')}`)
          const { readings, events } = await payloadProcessor(JSON.parse(value.toString('utf8')))
          await Promise.all([
            forwardMessages(KAFKA_READINGS_TOPIC, key, readings),
            forwardMessages(KAFKA_EVENTS_TOPIC, key, events),
          ])
        } catch (err) {
          logger.warn(`Unexpected error processing payload. Error was ${err.message || err}`)
        }
      },
    })
    .then(() => {
      logger.info(`Kafka consumer has started`)
      logger.debug(`Subscribed to topic %s`, KAFKA_PAYLOAD_TOPIC)
    })
    .catch((err) => {
      logger.fatal(`Kafka consumer could not start consuming. Error was ${err.message || err}`)
    })

  return {
    disconnect: async () => {
      try {
        await consumer.stop()
        await consumer.disconnect()
        await producer.disconnect()
      } catch (err) {
        logger.warn(`Error disconnecting from kafka: ${err.message || err}`)
      }
    },
  }
}

export default mkPayloadPipeline

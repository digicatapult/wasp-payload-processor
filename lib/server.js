// server to handle health check request

const express = require('express')
const pinoHttp = require('pino-http')

const { PORT } = require('./env')
const mkLogger = require('./logger')
const mkPayloadPipeline = require('./payloadPipeline')

const run = (options = {}) => {
  async function createHttpServer() {
    const app = express()

    const logger = mkLogger(options.sensorType)
    const requestLogger = pinoHttp({ logger })

    // I'm leaving this in even though it's not used initially
    // just in case we add other routes. It's good boilerplate
    app.use((req, res, next) => {
      /* istanbul ignore next */
      if (req.path !== '/health') requestLogger(req, res)
      next()
    })

    app.get('/health', async (req, res) => {
      res.status(200).send({ status: 'ok' })
    })

    // Sorry - app.use checks arity
    /* istanbul ignore next */
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      logger.error('Fallback Error %j', err.stack)
      res.status(500).send('Fatal error!')
    })

    const payloadPipeline = await mkPayloadPipeline({
      ...options,
      logger,
    })

    return { app, logger, payloadPipeline }
  }

  /* istanbul ignore next */
  async function startServer() {
    const { app, logger, payloadPipeline } = await createHttpServer()

    const setupGracefulExit = ({ sigName, server, exitCode }) => {
      process.on(sigName, async () => {
        await payloadPipeline.disconnect()

        server.close(() => {
          process.exit(exitCode)
        })
      })
    }

    const server = app.listen(PORT, (err) => {
      if (err) throw new Error('Binding failed: ', err)
      logger.info(`Listening on port ${PORT} `)
    })

    setupGracefulExit({ sigName: 'SIGINT', server, exitCode: 0 })
    setupGracefulExit({ sigName: 'SIGTERM', server, exitCode: 143 })
  }

  return { startServer, createHttpServer }
}

module.exports = { run }

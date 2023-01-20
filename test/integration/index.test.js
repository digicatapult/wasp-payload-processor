import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import { setupServer } from './helpers/server.js'
import { setupKafka } from './helpers/kafka.js'

import { BYTE_PAYLOAD, EMPTY_PAYLOAD, INVALID_PAYLOAD } from './data/payloads.js'

import { buildService } from '../../lib/index.js'

const defaultOptions = {
  sensorType: 'test-sensor',
  payloadProcessor:
    () =>
    ({ thingId, timestamp, payload }) => {
      if (payload === 'invalid') {
        throw new Error('Invalid payload')
      }

      const asBuffer = Buffer.from(payload, 'base64')
      return {
        readings: [...asBuffer].map((b, i) => ({
          dataset: {
            thingId,
            type: 'byte',
            label: `index-${i}`,
            unit: 'B',
          },
          timestamp,
          value: b,
        })),
        events:
          asBuffer.length !== 0
            ? [
                {
                  thingId,
                  timestamp,
                  type: 'TEST_EVENT_1',
                  details: { name: 'First' },
                },
                {
                  thingId,
                  timestamp,
                  type: 'TEST_EVENT_2',
                  details: { name: 'Second' },
                },
              ]
            : undefined,
      }
    },
}

describe('Builder', function () {
  it('should export a buildService function', function () {
    expect(buildService).to.be.a('function')
  })
})

describe('Health Check', function () {
  const context = { options: defaultOptions }
  setupServer(context)

  before(async function () {
    context.response = await context.request.get('/health')
  })

  it('should return 200', function () {
    expect(context.response.status).to.equal(200)
  })

  it('should return success', function () {
    expect(context.response.body).to.deep.equal({ status: 'ok' })
  })
})

describe('Payload Parsing', function () {
  const setupContext = { options: defaultOptions }
  setupServer(setupContext)
  setupKafka(setupContext)

  describe('Happy Path', function () {
    const context = {}
    before(async function () {
      context.messageTimestamp = new Date().toString()
      Object.assign(context, BYTE_PAYLOAD(context.messageTimestamp))
      context.result = await setupContext.kafka.publishAndWaitForReadings('payloads.test-sensor', context.message, 10)
    })

    it('should have forwarder the correct readings', function () {
      const readings = context.result.get('readings')
      expect(readings).deep.equal(context.expectedReadings)
    })

    it('should have forwarder the correct events', function () {
      const events = context.result.get('events')
      expect(events).deep.equal(context.expectedEvents)
    })
  })

  describe('Happy Path (no readings or events)', function () {
    const context = {}
    before(async function () {
      context.messageTimestamp = new Date().toString()
      Object.assign(context, EMPTY_PAYLOAD(context.messageTimestamp))
      context.result = await setupContext.kafka.publishAndWaitForReadings('payloads.test-sensor', context.message, 0)
    })

    it('should have forwarder the correct readings', function () {
      const readings = context.result.get('readings')
      expect(readings).deep.equal(context.expectedReadings)
    })

    it('should have forwarder the correct events', function () {
      const events = context.result.get('events')
      expect(events).deep.equal(context.expectedEvents)
    })
  })

  // this tests what happens if we have a "bad" payload. At the moment we just log and move on
  // but I imagine we should use a dead letter approach and store it somewhere.
  // the test sends an invalid message and then a valid one. If the error were not handled either a promise
  // rejection would be raised and unhandled or the message would be nacked and kafka would continually retry
  // that message. Because of this we never see the valid payload messages come through
  describe('invalid payload', function () {
    const context = {}
    before(function () {
      context.handlerFn = function (error) {
        context.error = error
      }
      process.on('unhandledRejection', context.handlerFn)
    })

    after(function () {
      process.removeListener('unhandledRejection', context.handlerFn)
    })

    before(async function () {
      context.messageTimestamp = new Date().toString()
      context.invalidMessage = {}
      context.validMessage = {}
      Object.assign(context.invalidMessage, INVALID_PAYLOAD(context.messageTimestamp))
      Object.assign(context.validMessage, BYTE_PAYLOAD(context.messageTimestamp))
      context.invalidResult = await setupContext.kafka.publishAndWaitForReadings(
        'payloads.test-sensor',
        context.invalidMessage.message,
        0
      )
      context.validResult = await setupContext.kafka.publishAndWaitForReadings(
        'payloads.test-sensor',
        context.validMessage.message,
        10
      )
    })

    it('should not forward readings for invalid payload', function () {
      const readings = context.invalidResult.get('readings')
      expect(readings).deep.equal(context.invalidMessage.expectedReadings)
    })

    it('should not forward events for invalid payload', function () {
      const events = context.invalidResult.get('events')
      expect(events).deep.equal(context.invalidMessage.expectedEvents)
    })

    it('should receive correct readings for valid payload', function () {
      const readings = context.validResult.get('readings')
      expect(readings).deep.equal(context.validMessage.expectedReadings)
    })

    it('should receive correct events for valid payload', function () {
      const events = context.validResult.get('events')
      expect(events).deep.equal(context.validMessage.expectedEvents)
    })

    it('should have handled the promise rejection', function () {
      expect(context.error).to.equal(undefined)
    })
  })
})

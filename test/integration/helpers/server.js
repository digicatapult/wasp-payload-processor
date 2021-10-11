const { before, after } = require('mocha')
const request = require('supertest')

const lib = require('../../../lib')

const setupServer = (context) => {
  before(async function () {
    this.timeout(30000)
    const { createHttpServer } = lib.buildService(context.options)
    Object.assign(context, await createHttpServer())
    context.request = request(context.app)
  })

  after(async function () {
    this.timeout(10000)
    await context.payloadPipeline.disconnect()
  })
}

module.exports = { setupServer }

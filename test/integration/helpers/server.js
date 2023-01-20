import { before, after } from 'mocha'
import request from 'supertest'

import { buildService } from '../../../lib/index.js'

const setupServer = (context) => {
  before(async function () {
    this.timeout(30000)
    const { createHttpServer } = await buildService(context.options)
    Object.assign(context, await createHttpServer())
    context.request = request(context.app)
  })

  after(async function () {
    this.timeout(10000)
    await context.payloadPipeline.disconnect()
  })
}

export { setupServer }

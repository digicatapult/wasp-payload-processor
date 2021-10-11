const buildService = (options) => {
  // note the dynamic require here so we only instantiate everything else until buildService is called
  const server = require('./server')
  return server.run(options)
}

module.exports = {
  buildService,
}

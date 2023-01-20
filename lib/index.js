const buildService = async (options) => {
  // note the dynamic import here so we only instantiate everything else until buildService is called
  const server = await import('./server.js')
  return server.run(options)
}

export { buildService }

require('dotenv').config();
const app = require('./src/app');
const store = require('./src/stores/aircraft-store');
const loggers = require('./src/lib/logger');
const { app: logger } = loggers;
const _ = require('lodash');

let connections = [];

logger.info('starting serve1090');

app(process.env.PORT, store, loggers).then(server => {
  // maintain array of current ws connections and purge them when they are closed
  // so that server shutdown can proceed normally
  server.on('connection', connection => {
    logger.info('connection established');
    connections.push(connection);
    connection.on('close', () => {
      logger.info('connection closed');
      connections = _.without(connections, connection);
    });
  });
  process.on('SIGTERM', shutdown(server));
  process.on('SIGINT', shutdown(server));
});

function shutdown () {
  return () => {
    logger.info('received shutdown signal');
    // kill store jobs
    store.shutdown();
    // kill all connections
    connections.forEach(curr => curr.destroy());
    logger.info('serve1090 shutdown complete');
    process.exit(0);
  };
}
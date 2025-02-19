const server = require('./src/app');

server.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${process.env.PORT}`);
});

module.exports = server;

// eslint-disable-next-line no-unused-vars
const internalErrorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500)
    .json({ message: 'Internal server error' });
};

module.exports = {
  internalErrorHandler,
};

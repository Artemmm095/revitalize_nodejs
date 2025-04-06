// eslint-disable-next-line consistent-return
const emptyFieldsHandler = (err, req, res, next) => {
  if (err.code === '23502') {
    return res.status(400)
      .json({ message: 'One or more required fields are empty' });
  }

  next(err);
};

// eslint-disable-next-line consistent-return
const uniquenessConstraintHandler = (err, req, res, next) => {
  if (err.code === '23505' && err.fields) {
    const fieldName = Object.keys(err.fields)[0];

    return res.status(400)
      .json({ message: `${fieldName} is already in use` });
  }

  next(err);
};

module.exports = {
  emptyFieldsHandler,
  uniquenessConstraintHandler,
};

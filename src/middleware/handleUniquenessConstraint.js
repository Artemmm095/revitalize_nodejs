// eslint-disable-next-line consistent-return
const handleUniquenessConstraint = (err, res, next) => {
  try {
    if (err.code === '23505' && err.constraint === err.fields) {
      const fieldName = err.fields[0];

      return res.status(400)
        .json({
          errors: [{
            field: fieldName,
            msg: `${fieldName} is already in use`,
          }],
        });
    }

    next(err);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  handleUniquenessConstraint,
};

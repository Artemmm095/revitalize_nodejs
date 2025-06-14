// eslint-disable-next-line consistent-return
const emailUniquenessConstraintHandler = (err, req, res, next) => {
  if (err.code === '23505') {
    return res.status(400)
      .json({ message: 'Email is already in use' });
  }

  next(err);
};

module.exports = {
  emailUniquenessConstraintHandler,
};

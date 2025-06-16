// eslint-disable-next-line consistent-return
const checkUserIDMatch = (req, res, next) => {
  if (Number(req.params.userId) !== Number(req.user.userId)) {
    return res.status(401)
      .json({ message: 'No permission' });
  }

  next();
};

module.exports = {
  checkUserIDMatch,
};

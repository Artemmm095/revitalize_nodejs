const extractToken = (req) => ((
  req.headers.authorization !== undefined
    && req.headers.authorization.startsWith('Bearer')
) ? req.headers.authorization.split(' ')[1]
  : req.header('Authorization')
);

module.exports = {
  extractToken,
};

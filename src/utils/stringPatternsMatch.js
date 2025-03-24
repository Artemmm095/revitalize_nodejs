const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])\S{6,12}$/;

const passwordMatch = (string) => passwordPattern.test(string);

module.exports = {
  passwordMatch,
};

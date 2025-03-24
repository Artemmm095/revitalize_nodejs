const {
  passwordMatch,
} = require('./stringPatternsMatch');

const validPasswords = [
  'te$tPass1234',
  'te$tP1',
  'test@Pass1',
  'test^Pass1',
  'test©Pass1',
  'test√Pass1',
  'test∆Pass1',
  'test+Pass1',
  'test=Pass1',
  'test-Pass1',
  'test_Pass1',
  'test~Pass1',
  'test.Pass1',
  'test,Pass1',
  'test?Pass1',
  't€$1P@$$',
];
const invalidPasswords = [
  'testpass',
  'te$tpass1',
  'TE$TPASS1',
  'testPass',
  'te$tPass',
  'testPass1',
  'te$t1',
  'te$tPass12345',
  'te$t Pass1',
  '',
  '      ',
  '#$_&+@',
  '123456',
];

describe('Password validation', () => {
  it('should return true for valid passwords', () => {
    validPasswords.forEach((password) => {
      expect(passwordMatch(password)).toBe(true);
    });
  });

  it('should return false for invalid passwords', () => {
    invalidPasswords.forEach((password) => {
      expect(passwordMatch(password)).toBe(false);
    });
  });
});

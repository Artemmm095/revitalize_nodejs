const {
  validateEmail, validatePassword,
} = require('./validation');

const validEmails = [
  'testemail@example.com',
  'testEmail@example.com',
  'testemail@Example.com',
  'testemail@example.Com',
  'TESTEMAIL@EXAMPLE.COM',
  'testemail123@example.com',
  'testemail@example123.com',
  'testemail@example.1com',
  '1234567@example.com',
  'testemail@1234567.com',
  'testemail@example.123',
  't@example.com',
  'testemail@e.c',
  'test.email@example.com',
  'test.e.mail.inbox@example.com',
  'testemail@example.com.at.uk',
  'test-email@example.com',
  'test-e-mail-inbox@example.com',
  'testemail@ex-ample.com',
  'testemail@ex-ample-ex-ample.com',
  'testemail@ex-ample.com',
  'test_email@example.com',
  'test_e_mail_inbox@example.com',
  'test-email_in.box@example.com',
];
const invalidEmails = [
  'testemailexample.com',
  'testemailexamplecom',
  'testemail@examplecom',
  'testemail.example.com',
  'test$email@example.com',
  'testemail@ex@ample.com',
  'testemail@example.c&m',
  'testemail@examplecom',
  '@example.com',
  'testemail@',
  'testemail@.com',
  'testemail@example-com',
  'testemail@-example.com',
  'testemail@example-.com',
  'testemail@.example.com',
  'testemail@example.com.',
  '-testemail@example.com',
  'testemail-@example.com',
  '.testemail@example.com',
  'testemail.@example.com',
  '_testemail@example.com',
  'testemail_@example.com',
  'test..email@example.com',
  'testemail@example..com',
  'test--email@example.com',
  'testemail@ex--ample.com',
  'test__email@example.com',
  '',
  '       ',
  '   @   .   ',
  '___@___.___',
  '---@---.---',
  '@@@@@@@@@@@@@',
  '...........',
  '-----------',
];

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

describe('Email validation', () => {
  it('should return true for valid emails', () => {
    validEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(true);
    });
  });

  it('should return false for invalid emails', () => {
    invalidEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(false);
    });
  });
});

describe('Password validation', () => {
  it('should return true for valid passwords', () => {
    validPasswords.forEach((password) => {
      expect(validatePassword(password)).toBe(true);
    });
  });

  it('should return false for invalid passwords', () => {
    invalidPasswords.forEach((password) => {
      expect(validatePassword(password)).toBe(false);
    });
  });
});

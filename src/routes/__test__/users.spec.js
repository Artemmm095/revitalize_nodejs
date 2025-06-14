const supertest = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const { db } = require('../../database/db');

const request = supertest(app);

const user = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'user1@example.com',
  password: 'P@ssword1',
  avatar: 'img.png',
  country: 'UA',
};
const updatedUser = {
  firstName: 'Jack',
  lastName: 'Johnson',
  email: 'user12345@example.com',
  password: 'P@ssword123',
  avatar: 'new_img.png',
  country: 'US',
};

let authToken;
let expiredAuthToken;
let invalidAuthToken;
let passwordResetToken;
let expiredPasswordResetToken;
let invalidPasswordResetToken;

const cleanTable = async (table) => db.raw('TRUNCATE TABLE ?? RESTART IDENTITY CASCADE', [table]);

const getUserId = async () => {
  const userFromDB = await db('users').first();

  return userFromDB.user_id;
};

const addUserToDB = async ({ email, password }) => db('users').insert({
  first_name: 'John',
  last_name: 'Doe',
  email,
  password: await bcrypt.hash(password, 10),
  country: 'UA',
});

const createAuthToken = async () => {
  const userId = await getUserId();

  authToken = jwt.sign(
    {
      userId,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    },
  );
  expiredAuthToken = jwt.sign(
    {
      userId,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '-1h',
    },
  );
  invalidAuthToken = jwt.sign(
    {
      userId,
      email: user.email,
    },
    'wrong_jwt_secret',
    {
      expiresIn: '1h',
    },
  );
};

const createRevokedAuthToken = async () => {
  const userId = await getUserId();

  const token = jwt.sign(
    {
      userId,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    },
  );

  await db('revoked_tokens').insert({ token });

  return token;
};

const createPasswordResetToken = async () => {
  const userId = await getUserId();

  passwordResetToken = jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  );
  expiredPasswordResetToken = jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '-15m',
    },
  );
  invalidPasswordResetToken = jwt.sign(
    {
      userId,
    },
    'wrong_jwt_secret',
    {
      expiresIn: '15m',
    },
  );
};

describe('users endpoint', () => {
  describe('POST /create', () => {
    beforeEach(async () => {
      await cleanTable('users');
    });

    it('should register a user', async () => {
      const res = await request.post('/users/create').send(user);

      expect(res.status).toBe(201);
      expect(res.body.message).toEqual('User created');

      const userFromDB = await db.select(
        'first_name as firstName',
        'last_name as lastName',
        'email',
        'country',
      )
        .from('users')
        .where('email', user.email).first();

      const expectedUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country,
      };

      expect(userFromDB).toMatchObject(expectedUser);
    });

    it('should return error 400 if user with provided email already exists', async () => {
      await addUserToDB({
        email: user.email,
        password: user.password,
      });

      const res = await request.post('/users/create').send(user);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('Email is already in use');
    });

    it('should return error 400 if email is invalid', async () => {
      const res = await request.post('/users/create').send({
        ...user,
        email: 'user1examplecom',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('Email should be in the format `username@example.com`');
    });

    it('should return error 400 if password is invalid', async () => {
      const res = await request.post('/users/create').send({
        ...user,
        password: 'password',
      });

      expect(res.status).toBe(400);
      expect(res.body.message)
        .toEqual('Password should be 6 - 12 characters, contain uppercase and lowercase letters, special characters and digits');
    });

    it('should return error 400 if one or more required fields are empty', async () => {
      const res = await request.post('/users/create').send({
        ...user,
        email: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('One or more required fields are empty');
    });
  });

  describe('POST /login', () => {
    beforeAll(async () => {
      await cleanTable('users');
      await addUserToDB({
        email: user.email,
        password: user.password,
      });
    });

    it('should login a user', async () => {
      const res = await request.post('/users/login').send({
        email: user.email,
        password: user.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('Authorization successful');
      expect(res.body).toHaveProperty('token');

      const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);

      const userFromDB = await db('users')
        .where({ email: user.email }).first();

      expect(payload.userId).toEqual(userFromDB.user_id);
      expect(payload.email).toEqual(userFromDB.email);
    });

    it('should return error 404 if user is not found by specified email', async () => {
      const res = await request.post('/users/login').send({
        email: 'nonexistentemail@example.com',
        password: user.password,
      });
      expect(res.status).toBe(404);
      expect(res.body.message).toEqual('User not found');
    });

    it('should return error 400 if specified password is incorrect', async () => {
      const res = await request.post('/users/login').send({
        email: user.email,
        password: 'P@ss$word2',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('Incorrect password');
    });

    it('should return error 400 if email is invalid', async () => {
      const res = await request.post('/users/login').send({
        email: 'user1examplecom',
        password: user.password,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('Email should be in the format `username@example.com`');
    });

    it('should return error 400 if password is invalid', async () => {
      const res = await request.post('/users/login').send({
        email: user.email,
        password: 'password',
      });

      expect(res.status).toBe(400);
      expect(res.body.message)
        .toEqual('Password should be 6 - 12 characters, contain uppercase and lowercase letters, special characters and digits');
    });

    it('should return error 400 if one or more required fields are empty', async () => {
      const res = await request.post('/users/login').send({
        email: '',
        password: 'password',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('One or more required fields are empty');
    });
  });

  describe('GET /', () => {
    beforeAll(async () => {
      await cleanTable('users');
    });

    it('should return error 404 if users not found', async () => {
      const res = await request.get('/users/');

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual('Not found');
    });

    it('should get a list of all users', async () => {
      await addUserToDB({
        email: user.email,
        password: user.password,
      });
      await addUserToDB({
        email: 'user2@example.com',
        password: user.password,
      });
      await addUserToDB({
        email: 'random@example.com',
        password: user.password,
      });

      const res = await request.get('/users/');

      expect(res.status).toBe(200);

      const usersFromDB = await db('users');

      const normalizedUsersFromDB = usersFromDB.map((userObject) => ({
        ...userObject,
        created_at: userObject.created_at.toISOString(),
        updated_at: userObject.updated_at.toISOString(),
      }));

      expect(res.body.users).toEqual(normalizedUsersFromDB);
    });
  });

  describe('PATCH /update-profile', () => {
    beforeEach(async () => {
      await cleanTable('users');
      await addUserToDB({
        email: user.email,
        password: user.password,
      });
      await createAuthToken();
    });

    it('should update user profile (change all available fields)', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        country: updatedUser.country,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('Profile updated');

      const userFromDB = await db.select(
        'first_name as firstName',
        'last_name as lastName',
        'email',
        'country',
      )
        .from('users')
        .where('user_id', userId).first();

      const expectedUser = {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        country: updatedUser.country,
      };

      expect(userFromDB).toMatchObject(expectedUser);
    });

    it('should update user profile (change only one field, firstName)', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        firstName: updatedUser.firstName,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('Profile updated');

      const userFromDB = await db.select(
        'first_name as firstName',
        'last_name as lastName',
        'email',
        'country',
      )
        .from('users')
        .where('user_id', userId).first();

      const expectedUser = {
        firstName: updatedUser.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country,
      };

      expect(userFromDB).toMatchObject(expectedUser);
    });

    it('should return error 401 if authorization token is missing', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: updatedUser.email,
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('Unauthorized user');
    });

    it('should return error 403 if authorization token is invalid', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: updatedUser.email,
      }).set('Authorization', `Bearer ${invalidAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Invalid authorization token');
    });

    it('should return error 403 if authorization token is expired', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: updatedUser.email,
      }).set('Authorization', `Bearer ${expiredAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Authorization token is no longer available');
    });

    it('should return error 403 if authorization token is revoked', async () => {
      const userId = await getUserId();
      const revokedAuthToken = await createRevokedAuthToken();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: updatedUser.email,
      }).set('Authorization', `Bearer ${revokedAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Authorization token is no longer available');

      await cleanTable('revoked_tokens');
    });

    it('should return error 404 if user not found', async () => {
      const res = await request.patch('/users/9999/update-profile').send({
        email: updatedUser.email,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual('User not found');
    });

    it('should return error 401 if user tries to update another user`s profile', async () => {
      await addUserToDB({
        email: 'user2@example.com',
        password: user.password,
      });

      const res = await request.patch('/users/2/update-profile').send({
        email: updatedUser.email,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('No permission');
    });

    it('should return error 400 if user with provided email already exists', async () => {
      await addUserToDB({
        email: 'random@example.com',
        password: user.password,
      });
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: 'random@example.com',
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('Email is already in use');
    });

    it('should return error 400 if email is invalid', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: 'user1examplecom',
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('Email should be in the format `username@example.com`');
    });

    it('should return error 400 if one ore more required fields are empty', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: '',
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('One or more required fields are empty');
    });
  });

  describe('PATCH /update-password', () => {
    beforeEach(async () => {
      await cleanTable('users');
      await addUserToDB({
        email: user.email,
        password: user.password,
      });
      await createAuthToken();
    });

    it('should change password', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-password`).send({
        currentPassword: user.password,
        password: updatedUser.password,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('Password updated');

      const userFromDB = await db('users')
        .where({ user_id: userId }).first();

      const passwordMatch = await bcrypt.compare(updatedUser.password, userFromDB.password);

      expect(passwordMatch).toBe(true);
    });

    it('should return error 401 if authorization token is missing', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-password`).send({
        currentPassword: user.password,
        password: updatedUser.password,
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('Unauthorized user');
    });

    it('should return error 403 if authorization token is invalid', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-password`).send({
        currentPassword: user.password,
        password: updatedUser.password,
      }).set('Authorization', `Bearer ${invalidAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Invalid authorization token');
    });

    it('should return error 403 if authorization token is expired', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-password`).send({
        currentPassword: user.password,
        password: updatedUser.password,
      }).set('Authorization', `Bearer ${expiredAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Authorization token is no longer available');
    });

    it('should return error 403 if authorization token is revoked', async () => {
      const userId = await getUserId();
      const revokedAuthToken = await createRevokedAuthToken();

      const res = await request.patch(`/users/${userId}/update-password`).send({
        currentPassword: user.password,
        password: updatedUser.password,
      }).set('Authorization', `Bearer ${revokedAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Authorization token is no longer available');

      await cleanTable('revoked_tokens');
    });

    it('should return error 404 if user not found', async () => {
      const res = await request.patch('/users/9999/update-password').send({
        currentPassword: user.password,
        password: updatedUser.password,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual('User not found');
    });

    it('should return error 401 if user tries to update another user`s password', async () => {
      await addUserToDB({
        email: 'user2@example.com',
        password: 'usEr1%1',
      });

      const res = await request.patch('/users/2/update-password').send({
        currentPassword: user.password,
        password: updatedUser.password,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('No permission');
    });

    it('should return error 400 if new password is invalid', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-password`).send({
        currentPassword: user.password,
        password: 'password',
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message)
        .toEqual('Password should be 6 - 12 characters, contain uppercase and lowercase letters, special characters and digits');
    });

    it('should return error 400 if current password is incorrect', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-password`).send({
        currentPassword: 'P@ss$word2',
        password: updatedUser.password,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('Current password is incorrect');
    });

    it('should return error 400 if new password matches with the current one', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-password`).send({
        currentPassword: user.password,
        password: user.password,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message)
        .toEqual('New password should not match with the current one');
    });

    it('should return error 400 if one or more required fields are empty', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-password`).send({
        currentPassword: user.password,
        password: '',
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message)
        .toEqual('One or more required fields are empty');
    });
  });

  describe('PATCH /update-avatar', () => {
    beforeEach(async () => {
      await cleanTable('users');
      await addUserToDB({
        email: user.email,
        password: user.password,
      });
      await createAuthToken();
    });

    it('should change avatar', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-avatar`).send({
        avatar: updatedUser.avatar,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('Avatar updated');

      const userFromDB = await db('users')
        .where({ user_id: userId }).first();

      expect(userFromDB.avatar).toEqual(updatedUser.avatar);
    });

    it('should return error 401 if authorization token is missing', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-avatar`).send({
        avatar: updatedUser.avatar,
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('Unauthorized user');
    });

    it('should return error 403 if authorization token is invalid', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-avatar`).send({
        avatar: updatedUser.avatar,
      }).set('Authorization', `Bearer ${invalidAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Invalid authorization token');
    });

    it('should return error 403 if authorization token is expired', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-avatar`).send({
        avatar: updatedUser.avatar,
      }).set('Authorization', `Bearer ${expiredAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Authorization token is no longer available');
    });

    it('should return error 403 authorization token is revoked', async () => {
      const userId = await getUserId();
      const revokedAuthToken = await createRevokedAuthToken();

      const res = await request.patch(`/users/${userId}/update-avatar`).send({
        avatar: updatedUser.avatar,
      }).set('Authorization', `Bearer ${revokedAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Authorization token is no longer available');

      await cleanTable('revoked_tokens');
    });

    it('should return error 404 if user not found', async () => {
      const res = await request.patch('/users/9999/update-avatar').send({
        avatar: updatedUser.avatar,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual('User not found');
    });

    it('should return error 401 if user tries to update another user`s avatar', async () => {
      await addUserToDB({
        email: 'user2@example.com',
        password: user.password,
      });

      const res = await request.patch('/users/2/update-avatar').send({
        avatar: updatedUser.avatar,
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('No permission');
    });

    it('should return error 400 if avatar field is empty', async () => {
      const userId = await getUserId();

      const res = await request.patch(`/users/${userId}/update-avatar`).send({
        avatar: '',
      }).set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('One or more required fields are empty');
    });
  });

  describe('POST /request-password-reset', () => {
    beforeEach(async () => {
      await cleanTable('users');
      await addUserToDB({
        email: user.email,
        password: user.password,
      });
    });

    it('should successfully request the password reset', async () => {
      const res = await request.post('/users/request-password-reset').send({
        email: user.email,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('The password reset letter has been sent to your inbox');

      const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);

      const userFromDB = await db('users')
        .where({ email: user.email }).first();

      expect(payload.userId).toEqual(userFromDB.user_id);
    });

    it('should return error 404 if user not found', async () => {
      const res = await request.post('/users/request-password-reset').send({
        email: 'nonexistentuser@example.com',
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual('User not found');
    });

    it('should return error 400 if email is invalid', async () => {
      const res = await request.post('/users/request-password-reset').send({
        email: 'user1examplecom',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('Email should be in the format `username@example.com`');
    });
  });

  describe('POST /reset-password', () => {
    beforeEach(async () => {
      await cleanTable('users');
      await addUserToDB({
        email: user.email,
        password: user.password,
      });
      await createPasswordResetToken();
    });

    it('should reset the password', async () => {
      const userId = await getUserId();

      const res = await request.post('/users/reset-password').send({
        password: updatedUser.password,
      }).set('Authorization', passwordResetToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('Password has been successfully reset');

      const userFromDB = await db('users')
        .where({ user_id: userId }).first();

      const passwordMatch = await bcrypt.compare(updatedUser.password, userFromDB.password);

      expect(passwordMatch).toBe(true);
    });

    it('should return error 401 if password reset token is missing', async () => {
      const res = await request.post('/users/reset-password').send({
        password: updatedUser.password,
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('No permission');
    });

    it('should return error 403 if password reset token is invalid', async () => {
      const res = await request.post('/users/reset-password').send({
        password: updatedUser.password,
      }).set('Authorization', invalidPasswordResetToken);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Invalid password reset token');
    });

    it('should return error 403 if password reset token is expired', async () => {
      const res = await request.post('/users/reset-password').send({
        password: updatedUser.password,
      }).set('Authorization', expiredPasswordResetToken);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Password reset token is no longer available');
    });

    it('should return error 404 if user not found', async () => {
      const userId = await getUserId();

      await db('users')
        .where({ user_id: userId })
        .delete();

      const res = await request.post('/users/reset-password').send({
        password: updatedUser.password,
      }).set('Authorization', passwordResetToken);

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual('User not found');
    });

    it('should return error 400 if password is invalid', async () => {
      const res = await request.post('/users/reset-password').send({
        password: 'password',
      }).set('Authorization', passwordResetToken);

      expect(res.status).toBe(400);
      expect(res.body.message)
        .toEqual('Password should be 6 - 12 characters, contain uppercase and lowercase letters, special characters and digits');
    });

    it('should return error 400 if password field is empty', async () => {
      const res = await request.post('/users/reset-password').send({
        password: '',
      }).set('Authorization', passwordResetToken);

      expect(res.status).toBe(400);
      expect(res.body.message)
        .toEqual('One or more required fields are empty');
    });
  });

  describe('POST /logout', () => {
    beforeEach(async () => {
      await cleanTable('users');
      await cleanTable('revoked_tokens');
      await addUserToDB({
        email: user.email,
        password: user.password,
      });
      await createAuthToken();
    });

    it('should successfully revoke the authorization token', async () => {
      const res = await request.post('/users/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toEqual('Logout successful');

      const isRevoked = await db('revoked_tokens')
        .where({ token: authToken }).first();

      expect(isRevoked).not.toBeNull();
    });

    it('should return error 401 if authorization token is missing', async () => {
      const res = await request.post('/users/logout');

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('Unauthorized user');
    });

    it('should return error 403 if authorization token is invalid', async () => {
      const res = await request.post('/users/logout')
        .set('Authorization', `Bearer ${invalidAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Invalid authorization token');
    });

    it('should return error 403 if authorization token is expired', async () => {
      const res = await request.post('/users/logout')
        .set('Authorization', `Bearer ${expiredAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Authorization token is no longer available');
    });

    it('should return error 403 if token is already revoked', async () => {
      const revokedAuthToken = await createRevokedAuthToken();

      const res = await request.post('/users/logout')
        .set('Authorization', `Bearer ${revokedAuthToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Authorization token is no longer available');
    });
  });
});

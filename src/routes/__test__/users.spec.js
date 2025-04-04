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

let token;
let expiredToken;

const cleanTable = async () => db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

const getTestUserId = async () => {
  const user = await db('users').first();

  return user.user_id;
};

const addUserToDB = async ({ email, password }) => db('users').insert({
  first_name: 'John',
  last_name: 'Doe',
  email,
  password: await bcrypt.hash(password, 10),
  country: 'UA',
});

const loginUser = async () => {
  const userId = await getTestUserId();

  token = jwt.sign(
    {
      userId,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    },
  );
  expiredToken = jwt.sign(
    {
      userId,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '-1h',
    },
  );
};

describe('users endpoint', () => {
  describe('POST /create', () => {
    beforeEach(async () => {
      await cleanTable();
    });

    it('should register a user', async () => {
      const res = await request.post('/users/create').send(user);

      expect(res.status).toBe(201);
      expect(res.body.message).toEqual('User created');

      const userFromDB = await db.select(
        'first_name as firstName',
        'last_name as lastName',
        'email',
      )
        .from('users')
        .where('email', user.email).first();

      const expectedUser = {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        country: updatedUser.country,
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
  });

  describe('POST /login', () => {
    beforeAll(async () => {
      await cleanTable();
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
  });

  describe('GET /', () => {
    beforeAll(async () => {
      await cleanTable();
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
      await cleanTable();
      await addUserToDB({
        email: user.email,
        password: user.password,
      });
      await loginUser();
    });

    it('should update user profile (change all available fields)', async () => {
      const userId = await getTestUserId();

      const res = await request.post(`/users/${userId}/update-profile`).send({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        country: updatedUser.country,
      }).set('Authorization', `Bearer ${token}`);

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

    it('should update user profile (change only one field, email)', async () => {
      const userId = await getTestUserId();

      const res = await request.post(`/users/${userId}/update-profile`).send({
        email: updatedUser.email,
      }).set('Authorization', `Bearer ${token}`);

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
        firstName: user.firstName,
        lastName: user.lastName,
        email: updatedUser.email,
        country: user.country,
      };

      expect(userFromDB).toMatchObject(expectedUser);
    });

    it('should return error 401 if request has no token', async () => {
      const userId = await getTestUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: updatedUser.email,
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('Unauthorized user');
    });

    it('should return error 401 if request has invalid token', async () => {
      const userId = await getTestUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: updatedUser.email,
      }).set('Authorization', 'Invalid_token');

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Invalid authorization token');
    });

    it('should return error 401 if request has expired token', async () => {
      const userId = await getTestUserId();

      const res = await request.patch(`/users/${userId}/update-profile`).send({
        email: updatedUser.email,
      }).set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Expired authorization token');
    });

    it('should return error 404 if user not found', async () => {
      const res = await request.post('/users/9999/update-profile').send({
        email: updatedUser.email,
      }).set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual('User not found');
    });
  });
});

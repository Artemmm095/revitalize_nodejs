const supertest = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../app');
const { db } = require('../../database/db');

const request = supertest(app);

const user = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'user1@example.com',
  password: 'P@ssword1',
  image: 'img.png',
  country: 'UA',
};

const cleanTable = async () => db.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

const addUserToDB = async ({ email, password }) => db.raw(
  `INSERT INTO users
         (first_name, last_name, email, password, country)
       VALUES
         ('John', 'Doe', :email, :password, 'UA')`,
  {
    email,
    password: await bcrypt.hash(password, 10),
  },
);

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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      expect(userFromDB).toMatchObject(expectedUser);
    });

    it('should return error 400 if email already exists', async () => {
      await addUserToDB({
        email: user.email,
        password: user.password,
      });

      const res = await request.post('/users/create').send(user);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('User with provided email already exists');
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
      expect(res.body.message).toEqual('User is not found');
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

    it('should return error 404 if users are not found', async () => {
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
        email: 'user@example.com',
        password: user.password,
      });
      await addUserToDB({
        email: 'random@example.com',
        password: user.password,
      });

      const res = await request.get('/users/');

      expect(res.status).toBe(200);

      const usersFromDB = await db.select('*').from('users');

      const normalizedUsersFromDB = usersFromDB.map((userObject) => ({
        ...userObject,
        created_at: userObject.created_at.toISOString(),
        updated_at: userObject.updated_at.toISOString(),
      }));

      expect(res.body.users).toEqual(normalizedUsersFromDB);
    });
  });
});

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const bookRoutes = require('../routes/books');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
app.use(express.json());
app.use('/api/books', bookRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(await mongoServer.getUri(), { dbName: "booktest" });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Book.deleteMany();
});

test('should return empty book list', async () => {
  const res = await request(app).get('/api/books');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([]);
});
test('should create a new book', async () => {
  const res = await request(app).post('/api/books').send({
    title: "Test Book",
    author: "Tester"
  });
  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('_id');
  expect(res.body.title).toBe("Test Book");
});

test('should update an existing book', async () => {
  const book = await Book.create({ title: "Old", author: "Author" });

  const res = await request(app).put(`/api/books/${book._id}`).send({
    title: "Updated"
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.title).toBe("Updated");
});

test('should delete a book', async () => {
  const book = await Book.create({ title: "To Delete", author: "Author" });

  const res = await request(app).delete(`/api/books/${book._id}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ message: 'Book deleted' });
});


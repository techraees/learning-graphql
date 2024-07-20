const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/graphqlcrud', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a Mongoose schema and model for User
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

// GraphQL schema
const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
  }
  type Query {
    getUser(id: ID!): User
    getUsers: [User]
  }
  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): String
  }
`);

// Resolvers
const root = {
  getUser: async ({ id }) => {
    return await User.findById(id);
  },
  getUsers: async () => {
    return await User.find();
  },
  createUser: async ({ name, email }) => {
    const newUser = new User({ name, email });
    return await newUser.save();
  },
  updateUser: async ({ id, name, email }) => {
    const user = await User.findById(id);
    if (user) {
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      return await user.save();
    }
    return null;
  },
  deleteUser: async ({ id }) => {
    const user = await User.findById(id);
    if (user) {
      await User.deleteOne({ _id: id });
      return `User with id ${id} deleted successfully.`;
    }
    return `User with id ${id} not found.`;
  }
};

// Create an Express server
const app = express();

// Middleware for /graphql endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000/graphql'));

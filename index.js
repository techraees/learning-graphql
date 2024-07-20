// Importing required modules
const express = require('express'); // Express framework for creating the server
const { graphqlHTTP } = require('express-graphql'); // Middleware to connect GraphQL with Express
const { buildSchema } = require('graphql'); // Library used to build the GraphQL schema

// Sample data
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

// Define the GraphQL schema
const schema = buildSchema(`
  # User type representing a user entity with id, name, and email fields
  type User {
    id: ID!
    name: String!
    email: String!
  }
  
  # Query type defining the available read operations
  type Query {
    getUser(id: ID!): User
    getUsers: [User]
  }
  
  # Mutation type defining the available write operations
  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): String
  }
`);

// Define resolver functions for the schema fields
const root = {
  // Resolver for getUser query: Fetches a user by ID
  getUser: ({ id }) => users.find(user => user.id === parseInt(id)),

  // Resolver for getUsers query: Fetches the list of all users
  getUsers: () => users,

  // Resolver for createUser mutation: Creates a new user and adds it to the users array
  createUser: ({ name, email }) => {
    const newUser = { id: users.length + 1, name, email }; // Create new user object
    users.push(newUser); // Add the new user to the users array
    return newUser; // Return the new user
  },

  // Resolver for updateUser mutation: Updates an existing user's details based on ID
  updateUser: ({ id, name, email }) => {
    const user = users.find(user => user.id === parseInt(id)); // Find the user by ID
    if (user) {
      if (name !== undefined) user.name = name; // Update the user's name if provided
      if (email !== undefined) user.email = email; // Update the user's email if provided
    }
    return user; // Return the updated user
  },

  // Resolver for deleteUser mutation: Deletes a user by ID
  deleteUser: ({ id }) => {
    const userIndex = users.findIndex(user => user.id === parseInt(id)); // Find the user's index by ID
    if (userIndex !== -1) {
      users.splice(userIndex, 1); // Remove the user from the users array
      return `User with id ${id} deleted successfully.`; // Return success message
    }
    return `User with id ${id} not found.`; // Return not found message if user does not exist
  }
};

// Create an Express server
const app = express();

// Middleware for /graphql endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema, // Attach the GraphQL schema
  rootValue: root, // Attach the resolvers
  graphiql: true, // Enable the GraphiQL interface for testing
}));

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000/graphql'));

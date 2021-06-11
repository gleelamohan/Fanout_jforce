const { buildSchema } = require('graphql');
const {  fetchMessages } = require('./db');

const schema = buildSchema(`
    type Message {
      message: String!
      source: String!
  }

  type Query {
    messages: [Message]    
  }
`);

const rootValue = {
    messages: fetchMessages
};

module.exports = {
  schema,
  rootValue
};
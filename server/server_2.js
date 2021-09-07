// Avec express-graphql

const express = require('express');
const app = express();
const { graphqlHTTP } = require('express-graphql');
const bodyParser = require('body-parser');
const { buildSchema } = require('graphql');
const expressPlayground = require('graphql-playground-middleware-express').default;
const mongoose = require('mongoose');
const config = require('config')
const db = config.get('mongoURI');


app.use(bodyParser.json());
app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

// Mongoose model
const User = require('./models/user')

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
      type RootQuery {
        user(id:ID!): User!
      }

      type RootMutation {
        addUser(userInput:UserInput):User!
      }

      type User {
        _id: ID!
        email: String!
        password: String!
      }
      
      input UserInput {
        email: String!
        password: String!
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      user: async args => {
        try {
          const user = await User.findOne({ _id: args.id });
          return { ...user._doc }
        } catch (err) {
          throw err;
        }
      },
      addUser: async args => {
        try {
          const user = new User({
            email: args.userInput.email,
            password: args.userInput.password
          });
          const result = await user.save();

          return {
            ...result._doc
          }
        } catch (err) {
          throw err;
        }
      }
    },
    graphiql: true
  })
)

//Connect Database
const connectDB = async () => {
  try {
    await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    console.log('MongoDB Connected...');
  } catch (err) {
    console.log(err.message);
    //Exist process with failure
    process.exit(1);
  }
}
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Running running on port ${PORT}`);
})


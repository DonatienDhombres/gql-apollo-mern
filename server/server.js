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

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
      type RootQuery {
        hello: String
      }

      type RootMutation {
        someMutation: String
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      hello: () => {
        return 'Hello back !'
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
import dotenv from 'dotenv'
import 'reflect-metadata'
import express from 'express'
import { createConnection } from 'typeorm'
import { ApolloServer } from 'apollo-server-express'
import { GraphQLResponse } from 'apollo-server-types'
import { buildSchema } from 'type-graphql'

import getOrmConfig from './config/ormconfig'
import { authChecker } from './auth'

const LogPlugin = {
  requestDidStart(requestContext) {
    console.log('1️⃣')
    return {
      didResolveOperation (context) {
        console.log('2️⃣')
      },
      didEncounterErrors (context) {
        console.log('3️⃣')
      },
      willSendResponse (context) {
        console.log('4️⃣')
        console.log(context.response)
        const responseReplaced: GraphQLResponse = {
          data: context.response.data || null,
          errors: context.response.errors || [],
        }
        context.response = responseReplaced
      }
    }
  },
}

async function main() {
  // environment variables
  dotenv.config()
  const port: number = +process.env.PORT || +process.env.EXPRESS_PORT

  // db connection
  const ormconfig = getOrmConfig()
  await createConnection(ormconfig)
  console.log(`📜 db connected`)

  // express and graphql initialization
  const app = express()
  const schema = await buildSchema({
    resolvers: [__dirname + '/resolver/**/*.{ts,js}'],
    authChecker,
    authMode: 'error',
  })
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => ({ ...req.headers }),
    introspection: true,
    playground: true,
    formatError: (err) => err,
    formatResponse: (res, ctx) => res,
    plugins: [
      LogPlugin,
    ]
  })
  apolloServer.applyMiddleware({ app, path: '/graphql' })

  // start
  app.listen(port)
  console.log(`🧙‍♂️ server started on port [${port}]\n`)
}

main()

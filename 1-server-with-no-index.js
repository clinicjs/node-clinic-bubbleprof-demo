const mongojs = require('mongojs')
const fastify = require('fastify')

const db = mongojs('localhost:27017/npm')
const col = db.collection('modules')
const app = fastify()

// get 5 newest and 5 oldest, no index
app.get('/', function (req, reply) {
  col.find().sort({modified: -1}).limit(5, function (err, newest) {
    if (err) return reply.code(500).send(err)
    col.find().sort({modified: 1}).limit(5, function (err, oldest) {
      if (err) return reply.code(500).send(err)
      reply.send({
        newest,
        oldest
      })
    })
  })
})

app.listen(3000)

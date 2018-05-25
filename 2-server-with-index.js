const mongojs = require('mongojs')
const fastify = require('fastify')

const db = mongojs('localhost:27017/npm', ['fast', 'slow'])
const app = fastify()

// get 5 newest and 5 oldest, with index
app.get('/', function (req, reply) {
  db.fast.find().sort({modified: -1}).limit(5, function (err, newest) {
    if (err) return reply.code(500).send(err)
    db.fast.find().sort({modified: 1}).limit(5, function (err, oldest) {
      if (err) return reply.code(500).send(err)
      reply.send({
        newest,
        oldest
      })
    })
  })
})

app.listen(3000)

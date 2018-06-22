const mongojs = require('mongojs')
const fastify = require('fastify')

const db = mongojs('localhost:27017/npm')
const col = db.collection('modulesIndexed')
const app = fastify()

// get 5 newest and 5 oldest, with index in parallel
app.get('/', function (req, reply) {
  var newest
  var oldest

  col.find().sort({modified: -1}).limit(5, function (err, docs) {
    if (err) return reply.code(500).send(err)
    newest = docs
    if (oldest) send()
  })
  col.find().sort({modified: 1}).limit(5, function (err, docs) {
    if (err) return reply.code(500).send(err)
    oldest = docs
    if (newest) send()
  })

  function send () {
    reply.send({
      newest,
      oldest
    })
  }
})

app.listen(3000)

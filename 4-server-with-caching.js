const mongojs = require('mongojs')
const fastify = require('fastify')
const lru = require('lru')

const cache = lru({max: 10, maxAge: 5000})
const db = mongojs('localhost:27017/npm')
const col = db.collection('modulesIndexed')
const app = fastify()

// get 5 newest and 5 oldest, with index in parallel and cache them for 5s
app.get('/', function (req, reply) {
  var newest = cache.get('newest')
  var oldest = cache.get('oldest')

  if (newest && oldest) return send()

  col.find().sort({modified: -1}).limit(5, function (err, docs) {
    if (err) return reply.code(500).send(err)
    newest = docs
    cache.set('newest', docs)
    if (oldest) send()
  })
  col.find().sort({modified: 1}).limit(5, function (err, docs) {
    if (err) return reply.code(500).send(err)
    oldest = docs
    cache.set('oldest', docs)
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

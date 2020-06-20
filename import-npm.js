const mongojs = require('mongojs')
const get = require('simple-get')
const pump = require('pump')
const each = require('stream-each')
const ndjson = require('ndjson')
const readline = require('readline')

const stdout = process.stdout
const stdin = process.stdin
const eraseCurrentLine = '\x1B[2K'
const moveCursorToBeginning = '\x1B[1G'
const label = 'Synced documents count: '
let syncedCount = 0

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
})
rl.on('SIGINT', function () {
  console.log()
  rl.close()
  process.exit()
})

// make sure to have mongodb running
const db = mongojs('localhost:27017/npm', ['modulesIndexed', 'modules'])

db.modulesIndexed.ensureIndex({modified: 1})

db.modulesIndexed.find({}).sort({seq: -1}).limit(1, function (err, docs) {
  if (err) throw err
  sync(docs.length ? docs[0].seq + 1 : 0, function (err) {
    if (err) throw err
    console.log('done!')
  })
})

function sync (since, cb) {
  if (since) console.log('Syncing since: ', since)

  const npm = `https://skimdb.npmjs.com/registry/_changes?feed=continuous&include_docs=true&since=${since}`
  get(npm, function (err, res) {
    if (err) return cb(err)
    each(pump(res, ndjson.parse()), ondata, cb)

    function ondata (data, cb) {
      if (!data.doc.time) return cb()

      const doc = {
        _id: data.id,
        seq: data.seq,
        version: data.doc['dist-tags'].latest,
        modified: data.doc.time.modified
      }

      db.modulesIndexed.save(doc, function (err) {
        db.modules.save(doc, (err) => {
          stdout.write(`${eraseCurrentLine}${moveCursorToBeginning}${label}${(++syncedCount).toLocaleString()}`)
          cb(err)
        })
      })
    }
  })
}

# Bubbleprof Example

This is an example of a small real world-ish program. It contains an import script (`import-npm.js`) that imports the npm registry metadata into a mongodb running on localhost and a series of servers showcasing problems and improvements.

The mongodb will contain two collections `slow` and `fast` which contain the same data, except `fast` will contain an index for doing fast lookups and `slow` will not.

If you have docker installed you can install and run a mongo container by doing.

## Run Mongo

```sh
docker pull mongo

docker run -it -p 27017:27017 mongo
```

## Alternative

Some platforms may give a Docker error and reqire the following command instead

```sh
docker pull mongo

docker run -v $(pwd)/datadir:/data/db -p 27017:27017 -d mongo
```

## Import Data

Then to import some data

```sh
# note you can just run this for a bit and kill it
npm install
node import-npm.js
```

There are 4 iterations of a server that returns the 5 latest and 5 oldest updated modules on npm.

1.  Returns the latest and oldest 5 modules from an _unindexed_ collection
1.  Returns the latest and oldest 5 modules from an _indexed_ collection
1.  Returns the same as `2` but does the queries in parallel.
1.  Caches the result from `3` in 5s in an LRU cache.

Each should produce different bubbleprof results indicating the async profile of each. Running `1` you should see a ton of latency, running `2` you should see much more throughput, and running `3` you should see a few more branches in the async graph.

## Run BubbleProf

To run the first one do:

```sh
clinic bubbleprof --on-port 'autocannon localhost:$PORT -c 2' -- node 1-server-with-no-index.js
```

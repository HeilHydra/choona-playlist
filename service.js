var Waterway = require("waterway");
var config = require("config");
var PlaylistManager = require("./lib/PlaylistManager");

var NRP = require("node-redis-pubsub");
var lame = require("lame");
var Speaker = require("speaker");

var app = new Waterway(config.waterway);
var playlistManager = new PlaylistManager(app);

app.request("playlist", ":playlistId", "add", ":trackId")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).add(req.params.trackId);
  });

app.request("playlist", ":playlistId", "upvote", ":trackId")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).upvote(req.params.trackId);
  });

app.request("playlist", ":playlistId", "downvote", ":trackId")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).downvote(req.params.trackId);
  });

app.request("playlist", ":playlistId", "getQueue")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).getQueue();
  });

app.request("playlist", ":playlistId", "getStatus")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).getStatus();
  });

app.stream("playlist", ":playlistId", "stream")
  .writable(function (stream, req) {
    playlistManager.get(req.params.playlistId).streamTo(stream);
  });

var nrp = new NRP();
nrp.on("*", function (data, key) {
  key = key.split(":").map(function (part) {
    if (part !== "*") {
      return new Buffer(part, "base64").toString("utf8");
    }
    return "*";
  });
  // console.log(key.join(":"), data);
});

var client = new Waterway();
client
  .request("playlist", "1", "add", "5ipZFjdQSogmpRqUaKTCLW")
  .send()
  .then(function () {
    return client.request("playlist", "1", "add", "0KQZquKoSYtflDvj71SlGj").send();
  })
  .then(function () {
    return client.request("playlist", "1", "getQueue").send();
  })
  .then(function (queue) {
    console.log(queue.data);
    return client.stream("playlist", "1", "stream").readable();
  })
  .then(function (stream) {
    stream
      .pipe(new lame.Decoder())
      .pipe(new Speaker());
  })
  .catch(function (err) {
    console.log(err);
  });
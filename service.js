var Waterway = require("waterway");
var config = require("config");
var PlaylistManager = require("./lib/PlaylistManager");

var service = new Waterway(config.waterway);
var playlistManager = new PlaylistManager(service);

service.request("playlist", ":playlistId", "add", ":trackId")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).add(req.params.trackId);
  });

service.request("playlist", ":playlistId", "user", ":userId", "upvote", ":trackId")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).upvote(req.params.trackId, req.params.userId);
  });

service.request("playlist", ":playlistId", "user", ":userId", "downvote", ":trackId")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).downvote(req.params.trackId, req.params.userId);
  });

service.request("playlist", ":playlistId", "getQueue")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).getQueue();
  });

service.request("playlist", ":playlistId", "getStatus")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).getStatus();
  });

service.stream("playlist", ":playlistId", "stream")
  .writable(function (stream, req) {
    playlistManager.get(req.params.playlistId).streamTo(stream);
  });

service.request("playlist", ":playlistId", "search", ":searchString")
  .respond(function (req) {
    return playlistManager.get(req.params.playlistId).search(req.params.searchString);
  });
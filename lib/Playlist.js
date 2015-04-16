var QueuedTrack = require("./QueuedTrack");
var PassThrough = require("stream").PassThrough;

function Playlist(service) {
  this._service = service;
  this._queue = [];
  this._currentTrack = null;
  this._trackStartTime = null;

  this._stream = new PassThrough();
}

Playlist.prototype.add = function (trackId) {
  var self = this;
  return this._service
    .request("source", "spotify", "getTrack", trackId)
    .send()
    .then(function (res) {
      self._queue.push(new QueuedTrack(res.data));
      if (self._currentTrack === null) {
        self._playNext();
      }
    });
};

Playlist.prototype.upvote = function (trackId) {
  var track = _.findWhere(this._queue, { trackId: trackId });
  track.upvote();
  this._sort();
};

Playlist.prototype.downvote = function (trackId) {
  var track = _.findWhere(this._queue, { trackId: trackId });
  track.downvote();
  this._sort();
};

Playlist.prototype.getQueue = function () {
  return this._queue;
};

Playlist.prototype.getStatus = function () {
  return {
    track: this._currentTrack,
    position: this._getTrackPosition()
  };
};

Playlist.prototype.streamTo = function (stream) {
  this._stream.pipe(stream, { end: false });
};


Playlist.prototype._sort = function () {
  this._queue = _.sortBy(this._queue, function (track) {
    return track.upvotes - track.downvotes;
  });
};

Playlist.prototype._getTrackPosition = function () {
  if (!this._currentTrack) {
    return 0;
  }
  var now = new Date();
  return (now - this._trackStartTime) / 1000;
};

Playlist.prototype._playNext = function () {
  var queued = this._queue.shift();
  if (!queued) {
    return;
  }

  this._currentTrack = queued;
  this._service
    .stream("source", "spotify", "play", queued.trackId)
    .readable()
    .then(this._handleTrackStart.bind(this));
};

Playlist.prototype._handleTrackStart = function (stream) {
  this._trackStartTime = new Date();
  stream.pipe(this._stream, { end: false });
  stream.on("end", this._handleTrackEnd.bind(this));
};

Playlist.prototype._handleTrackEnd = function () {
  this._currentTrack = null;
  this._playNext();
};

module.exports = Playlist;
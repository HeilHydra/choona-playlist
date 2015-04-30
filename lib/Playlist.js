var _ = require("lodash");
var QueuedTrack = require("./QueuedTrack");
var PassThrough = require("stream").PassThrough;

function Playlist(id, service) {
  this._id = id;
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
      var track = new QueuedTrack(res.data);
      self._queue.push(track);
      self._service.event("playlist", self._id, "added", trackId).emit(track);
      self._emitQueue();
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
    playing: this._currentTrack,
    position: this._getTrackPosition()
  };
};

Playlist.prototype.streamTo = function (stream) {
  this._stream.pipe(stream, { end: false });
};


Playlist.prototype._sort = function () {
  var nextQueue = _.sortBy(this._queue, function (track) {
    return track.upvotes - track.downvotes;
  });

  var isDifferent = _.find(this._queue, function (oldTrack, index) {
    return oldTrack !== nextQueue[index];
  });

  if (isDifferent) {
    this._queue = nextQueue;
    this._emitQueue();
  }
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

  this._emitQueue();
  this._service.event("playlist", this._id, "playing", queued.trackId).emit(queued);
};

Playlist.prototype._emitQueue = function () {
  this._service.event("playlist", this._id, "queue").emit(this._queue);
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
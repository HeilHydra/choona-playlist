function QueuedTrack(track) {
  this.track = track;
  this.trackId = track.id;
  this.upvotes = 1;
  this.downvotes = 1;
}

QueuedTrack.prototype.upvote = function () {
  this.upvotes++;
};

QueuedTrack.prototype.downvote = function () {
  this.downvotes++;
};

module.exports = QueuedTrack;
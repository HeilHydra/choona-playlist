function QueuedTrack(track) {
  this.track = track;
  this.trackId = track.id;
  this.upvotes = ["_internal"];
  this.downvotes = ["_internal"];
}

QueuedTrack.prototype.upvote = function (voterId) {
  if (this.upvotes.indexOf(voterId) === -1) {
    this.upvotes.push(voterId);
    return true;
  }
  return false;
};

QueuedTrack.prototype.downvote = function (voterId) {
  if (this.downvotes.indexOf(voterId) === -1) {
    this.downvotes.push(voterId);
    return true;
  }
  return false;
};

module.exports = QueuedTrack;
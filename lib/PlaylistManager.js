var Playlist = require("./Playlist");

function PlaylistManager(service) {
  this._service = service;
  this._playlists = {};
}

PlaylistManager.prototype.get = function (playlistId) {
  var playlist = this._playlists[playlistId];
  if (!playlist) {
    playlist = new Playlist(this._service);
    this._playlists[playlistId] = playlist;
  }
  return playlist;
};

module.exports = PlaylistManager;
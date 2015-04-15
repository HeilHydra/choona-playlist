var Playlist = require("./Playlist");

function PlaylistManager(app) {
  this._app = app;
  this._playlists = {};
}

PlaylistManager.prototype.get = function (playlistId) {
  var playlist = this._playlists[playlistId];
  if (!playlist) {
    playlist = new Playlist(this._app);
    this._playlists[playlistId] = playlist;
  }
  return playlist;
};

module.exports = PlaylistManager;
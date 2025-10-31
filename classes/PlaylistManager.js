import { Preferences } from "@capacitor/preferences";

/**
 * PlaylistManager クラス
 * 
 * - プレイリストの作成・削除・編集を管理
 * - StorageManager から楽曲情報を参照
 * - Preferences に永続化
 */
export class PlaylistManager {
  constructor(storageManager) {
    this.storage = storageManager; // StorageManagerのインスタンス
    this.playlistsKey = "playlists";
    this.playlists = [];
  }

  /**
   * 🔄 Preferencesからプレイリストを読み込む
   * @returns {Promise<Array>}
   */
  async loadPlaylists() {
    const stored = await Preferences.get({ key: this.playlistsKey });
    this.playlists = stored.value ? JSON.parse(stored.value) : [];
    return this.playlists;
  }

  /**
   * 💾 プレイリストをPreferencesに保存
   */
  async savePlaylists() {
    await Preferences.set({
      key: this.playlistsKey,
      value: JSON.stringify(this.playlists),
    });
  }

  /**
   * 🆕 新しいプレイリストを作成
   * @param {string} name プレイリスト名
   * @returns {object} 作成されたプレイリスト
   */
  async createPlaylist(name) {
    const newPlaylist = {
      id: crypto.randomUUID(),
      name,
      imgBase64Data: null, //サムネイル画像のbase64データ
      songs: [], // 曲の path の配列
    };

    this.playlists.push(newPlaylist);
    await this.savePlaylists();
    return newPlaylist;
  }

  /**
   * 🗑 プレイリストを削除
   * @param {string} playlistId
   */
  async deletePlaylist(playlistId) {
    this.playlists = this.playlists.filter(p => p.id !== playlistId);
    await this.savePlaylists();
  }

  /**
   * ✏️ プレイリスト名を変更
   * @param {string} playlistId
   * @param {string} newName
   */
  async renamePlaylist(playlistId, newName) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.name = newName;
      await this.savePlaylists();
    }
  }

  async setImage(playlistId, file) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    const base64 = await this.#fileToBase64(file);

    if (playlist) {
      playlist.imgBase64Data = base64;
      await this.savePlaylists();
    }
  }

  /**
   * ➕ 曲をプレイリストに追加
   * @param {string} playlistId
   * @param {string} songPath - StorageManagerで管理される曲のpath
   */
  async addSongToPlaylist(playlistId, songPath) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    if (!playlist.songs.includes(songPath)) {
      playlist.songs.push(songPath);
      await this.savePlaylists();
    }
  }

  /**
   * ➖ 曲をプレイリストから削除
   * @param {string} playlistId
   * @param {string} songPath
   */
  async removeSongFromPlaylist(playlistId, songPath) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    playlist.songs = playlist.songs.filter(p => p !== songPath);
    await this.savePlaylists();
  }

  /**
   * 🎵 プレイリスト内の曲データをStorageManager経由で取得
   * @param {string} playlistId
   * @returns {Promise<Array<{title: string, path: string}>>}
   */
  async getSongsInPlaylist(playlistId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return [];

    const allSongs = await this.storage.loadSongs();
    return allSongs.filter(song => playlist.songs.includes(song.path));
  }

  /**
   * 🔍 プレイリストを取得
   * @param {string} playlistId
   * @returns {object|null}
   */
  getPlaylist(playlistId) {
    return this.playlists.find(p => p.id === playlistId) || null;
  }

  /**
   * 📋 すべてのプレイリストを返す
   * @returns {Array}
   */
  getAllPlaylists() {
    return this.playlists;
  }

  #fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

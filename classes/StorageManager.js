import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export class StorageManager {
  constructor() {
    this.songsKey = 'importedSongs';  // Preferences のキー
  }

  /**
   * 🎵 楽曲一覧を読み込む
   * @returns {Promise<Array<{title: string, path: string}>>}
   */
  async loadSongs() {
    const stored = await Preferences.get({ key: this.songsKey });
    const songs = stored.value ? JSON.parse(stored.value) : [];
    songs.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
    return songs;
  }

  /**
   * 💾 楽曲一覧を保存する
   * @param {Array<{title: string, path: string}>} songs
   */
  async saveSongs(songs) {
    await Preferences.set({
      key: this.songsKey,
      value: JSON.stringify(songs),
    });
  }

  /**
   * 📥 新しい曲を追加または上書き保存する
   * @param {File} file - input要素から得たファイル
   */
  async importSong(file) {
    if (!file.type.startsWith('audio/')) return null;

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = this.arrayBufferToBase64(arrayBuffer);
    const title = file.name.replace(/\.mp3$/i, '');
    const path = `music/${file.name}`;

    // 既存リストを取得
    const songs = await this.loadSongs();
    const existingIndex = songs.findIndex(s => s.title === title);

    // ファイルを保存
    await Filesystem.writeFile({
      path,
      data: base64Data,
      directory: Directory.Data,
    });

    // リスト更新
    if (existingIndex !== -1) {
      songs[existingIndex] = { title, path };
    } else {
      songs.push({ title, path });
    }

    songs.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
    await this.saveSongs(songs);

    return { title, path };
  }

  /**
   * 🗑 曲を削除する
   * @param {string} path - 削除対象ファイルのパス
   */
  async deleteSong(path) {
    try {
      await Filesystem.deleteFile({
        path,
        directory: Directory.Data,
      });

      const songs = await this.loadSongs();
      const updated = songs.filter(song => song.path !== path);
      await this.saveSongs(updated);

      return true;
    } catch (err) {
      console.error("削除に失敗:", err);
      return false;
    }
  }

  /**
   * 📂 ファイルデータをBase64で取得
   * @param {string} path
   * @returns {Promise<string>} base64データ
   */
  async readFileAsBase64(path) {
    const { data } = await Filesystem.readFile({
      path,
      directory: Directory.Data,
    });
    return data;
  }

  /**
   * 🔄 ArrayBuffer → Base64変換
   * @param {ArrayBuffer} buffer
   * @returns {string}
   */
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

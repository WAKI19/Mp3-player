import { Filesystem, Directory } from "@capacitor/filesystem";

import { findSongIndexByTitle } from "./Utils";

import { NotificationUI } from "../ui/NotificationUI";

const notificationUI = new NotificationUI();

/**
 * AudioPlayer クラス
 * 
 * - audioタグ操作の抽象化
 * - 現在の曲・プレイリスト・再生状態の管理
 * - UI層にはイベント通知のみを行う
 */
export class AudioPlayer {
  constructor(audioElement) {
    this.audio = audioElement; // <audio>タグの参照
    this.setList = [];
    this.currentPlaylistId = null;
    this.currentIndex = null;
    this.currentSongTitle = null;
    this.isReady = false;

    // 再生状態を外部に通知するためのコールバック
    this.onPlay = null;
    this.onPause = null;
    this.onLoaded = null;
    this.canPlay = null;
    this.onTimeUpdate = null;
    this.onEnded = null;

    this.#attachEvents();
  }

  /**
   * 🎵 イベントリスナーを内部登録
   */
  #attachEvents() {
    this.audio.addEventListener("loadedmetadata", () => {
      this.isReady = true;
      if (this.onLoaded) this.onLoaded();
    });

    this.audio.addEventListener("loadeddata", () => {
        if (this.canPlay) this.canPlay();
    });

    this.audio.addEventListener("play", () => {
      if (this.onPlay) this.onPlay();
    });

    this.audio.addEventListener("pause", () => {
      if (this.onPause) this.onPause();
    });

    this.audio.addEventListener("timeupdate", () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.audio.currentTime, this.audio.duration);
      }
    });

    this.audio.addEventListener("ended", () => {
      if (this.onEnded) this.onEnded();
    });
  }


  setPlaylist(playlist) {
    this.currentPlaylistId = playlist.id;
    this.setSetList(playlist.songs);
  }

  unsetPlaylist() {
    this.currentPlaylistId = null;
  }

  /**
   * 📀 セットリストを設定
   * @param {Array<{title: string, path: string}>} songs
   */
  setSetList(songs) {
    this.setList = songs;
  }

  /**
   * ▶️ 再生
   */
  play() {
    if (this.isReady) {
      this.audio.play();
    }
  }

  /**
   * ⏸ 一時停止
   */
  pause() {
    this.audio.pause();
  }

  /**
   * 🔁 再生／停止のトグル
   */
  togglePlay() {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  /**
   * ⏩ 次の曲へ
   */
  async next() {
    this.currentIndex = findSongIndexByTitle(this.setList, this.currentSongTitle);
    if (this.currentIndex < this.setList.length - 1) {
      this.currentIndex++;
      await this.loadCurrentTrack();
    } else {
        this.currentIndex = 0;
        await this.loadCurrentTrack();
    }
  }

  /**
   * ⏪ 前の曲へ
   */
  async previous() {
    this.currentIndex = findSongIndexByTitle(this.setList, this.currentSongTitle);
    if (this.currentIndex > 0) {
      this.currentIndex--;
      await this.loadCurrentTrack();
    } else {
        this.currentIndex = this.setList.length - 1;
        await this.loadCurrentTrack();
    }
  }

  /**
   * 🕓 シークバー移動
   * @param {number} time - 秒単位
   */
  seek(time) {
    this.audio.currentTime = time;
  }

  /**
   * 🎶 現在のトラックをロード
   */
  async loadCurrentTrack() {
    const track = this.setList[this.currentIndex];
    if (!track) return;

    try {
      await Filesystem.stat({
        path: track.path,
        directory: Directory.Data,
      });
    } catch {
      const filename = track.path.split("/").pop();
      notificationUI.notify(`${filename}が見つかりません`, "error");
      this.currentIndex = null;
      return;
    }

    const { data } = await Filesystem.readFile({
      path: track.path,
      directory: Directory.Data,
    });

    this.currentSongTitle = track.title;
    this.audio.src = `data:audio/mp3;base64,${data}`;
    this.audio.load();
  }

  /**
   * 🎧 指定されたインデックスのトラックを再生
   * @param {number} index
   */
  async playTrack(index) {
    this.currentIndex = index;
    await this.loadCurrentTrack();
  }

  /**
   * 🧾 現在の曲情報を取得
   * @returns {object|null}
   */
  getCurrentTrack() {
    return this.setList[this.currentIndex] || null;
  }

  /**
   * 🔊 再生位置の割合（%）を取得
   * @returns {number} 0〜100
   */
  getProgress() {
    if (!this.audio.duration) return 0;
    return (this.audio.currentTime / this.audio.duration) * 100;
  }
}

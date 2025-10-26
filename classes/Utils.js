export function activate(elem) {
  elem.classList.add("active");
}

export function deactivate(elem) {
  elem.classList.remove("active");
}

export function enable(elem) {
  elem.style.opacity = "1";
  elem.style.pointerEvents = "auto";
}

export function disable(elem) {
  elem.style.opacity = "0.1";
  elem.style.pointerEvents = "none";
}

export function formatAudioDuration(duration) {
  if (isNaN(duration) || duration < 0) return "0:00";

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  // 2桁ゼロ埋め（秒・分）
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`; // 1時間以上 → hh:mm:ss
  } else {
    return `${minutes}:${ss}`; // 1時間未満 → m:ss
  }
}


/**
 * 曲リストとタイトルを受け取り、
 * 一致するタイトルの曲のインデックス番号を返す関数
 * 
 * @param {Array} songs - 曲リスト（例: [{ title: "track1", path: "music/track1.mp3" }, ...]）
 * @param {string} title - 探したい曲のタイトル
 * @returns {number} 見つかった曲のインデックス（見つからなければ -1）
 */
export function findSongIndexByTitle(songs, title) {
  return songs.findIndex(song => song.title === title);
}

/**
 * 曲リストと検索文字列を受け取り、
 * タイトルに文字列を含む曲だけを返す関数
 * 
 * @param {Array} songs - 曲リスト（例: [{ title: "track1", path: "music/track1.mp3" }, ...]）
 * @param {string} keyword - 検索文字列
 * @returns {Array} 条件に一致する曲リスト
 */
export function filterSongsByTitle(songs, keyword) {
  if (!keyword) return songs; // 空文字なら全件返す

  // 部分一致（大文字・小文字を区別せず）
  return songs.filter(song =>
    song.title.toLowerCase().includes(keyword.toLowerCase())
  );
}
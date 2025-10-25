import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

//グローバル変数
const currentAudio = document.getElementById("current-audio"); //曲再生用audioタグ

let currentPlaylist = [];
let currentIndex = 0;

let allSongsList = [];


//関数
async function loadAllSongsList() {
  const stored = await Preferences.get({ key: 'importedSongs' });
  allSongsList = stored.value ? JSON.parse(stored.value) : [];

  allSongsList.sort((a, b) => a.title.localeCompare(b.title, 'ja')); //あいうえお順にソート
}

function getAllSongsList() {
  return allSongsList;
}

function setCurrentPlaylist(songs) {
  currentPlaylist = songs;
}

function setCurrentIndex(index) {
  currentIndex = index;
}

async function setAudio() {
  const path = currentPlaylist[currentIndex].path;

  // ファイルをBase64形式で読み込む
  const { data } = await Filesystem.readFile({
    path,
    directory: Directory.Data,
  });

  currentAudio.src = `data:audio/mp3;base64,${data}`;
}

function toggleAudioPlay() {
  if (currentAudio.paused) {
    currentAudio.play();  // 停止中なら再生
  } else {
    currentAudio.pause(); // 再生中なら一時停止
  }
}

function togglePlayBtn() {
  playBtns.forEach(playBtn => {
    playBtn.innerHTML = "";

    if (currentAudio.paused) {
      playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
    } else {
      playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    }
  });
}

function setupMiniPlayer(duration) {
  const miniPlayerTitle = miniPlayer.querySelector('.song-title');
  const miniPlayerSongLength = miniPlayer.querySelector('.song-length');

  const currentTitle = currentPlaylist[currentIndex].title;

  miniPlayerTitle.textContent = currentTitle;
  miniPlayerSongLength.textContent = formatAudioDuration(duration);
}

function setupFullPlayer(duration) {
  const fullPlayerTitle = fullPlayer.querySelector('.song-title');
  const fullPlayerSongLength = fullPlayer.querySelector('.song-length');

  const currentTitle = currentPlaylist[currentIndex].title;

  fullPlayerTitle.textContent = currentTitle;
  fullPlayerSongLength.textContent = formatAudioDuration(duration);
  progressBar.max = duration;
}

function updateProgressColor() {
  const percentage = (progressBar.value / progressBar.max) * 100 || 0;
  progressBar.style.background = `linear-gradient(to right, var(--active-color) ${percentage}%, var(--bg-color) ${percentage}%)`;
}

function formatAudioDuration(duration) {
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
 * 曲リストと検索文字列を受け取り、
 * タイトルに文字列を含む曲だけを返す関数
 * 
 * @param {Array} songs - 曲リスト（例: [{ title: "track1", path: "music/track1.mp3" }, ...]）
 * @param {string} keyword - 検索文字列
 * @returns {Array} 条件に一致する曲リスト
 */
function filterSongsByTitle(songs, keyword) {
  if (!keyword) return songs; // 空文字なら全件返す

  // 部分一致（大文字・小文字を区別せず）
  return songs.filter(song =>
    song.title.toLowerCase().includes(keyword.toLowerCase())
  );
}


/**
 * 曲リストとタイトルを受け取り、
 * 一致するタイトルの曲のインデックス番号を返す関数
 * 
 * @param {Array} songs - 曲リスト（例: [{ title: "track1", path: "music/track1.mp3" }, ...]）
 * @param {string} title - 探したい曲のタイトル
 * @returns {number} 見つかった曲のインデックス（見つからなければ -1）
 */
function findSongIndexByTitle(songs, title) {
  return songs.findIndex(song => song.title === title);
}



//要素取得
  //全曲ページ
const deleteModeBtn = document.getElementById("delete-mode-btn");
const importBtn = document.getElementById("import-btn");
const fileInput = document.getElementById("file-input");
const allSongsSearchInput = document.getElementById('all-songs-search-input');
const allSongsSearchClearBtn = document.getElementById("all-songs-search-clear-btn");
const allSongsSongList = document.getElementById("all-songs-song-list");

  //プレイリストページ
const newPlaylistModalOpenBtn = document.getElementById("new-playlist-modal-open-btn");
const newPlaylistModalCloseBtn = document.getElementById("new-playlist-modal-close-btn");
const newPlaylistModal = document.getElementById("new-playlist-modal");
const playlistList = document.getElementById("playlist-list");
const playlistDetail = document.getElementById("playlist-detail");
const playlistDetailCloseBtn = document.getElementById("playlist-detail-close-btn");
const playlistDetailHeader = document.querySelector("#playlist-detail .header");
const playlistDetailHeaderTitle = document.querySelector("#playlist-detail .header .playlist-title");
const playlistDetailPlaylistTitle = document.querySelector("#playlist-detail .playlist-info .playlist-title");

const miniPlayer = document.getElementById("mini-player");
const playBtns = document.querySelectorAll(".play-btn");

const fullPlayer = document.getElementById("full-player");
const fullPlayerCloseBtn = document.getElementById("full-player-close-btn");
const progressBar = document.querySelector("#full-player .progress-bar");

const tabs = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");











//イベント
  //currentAudioが読み込まれた（変更された際の処理）
currentAudio.addEventListener('loadedmetadata', (e) => {
  const duration = e.target.duration;

  setupMiniPlayer(duration);
  setupFullPlayer(duration);
  activate(miniPlayer);
});

currentAudio.addEventListener('play', () => {
  togglePlayBtn();
});

currentAudio.addEventListener('pause', () => {
  togglePlayBtn();
});

currentAudio.addEventListener("timeupdate", () => {
  progressBar.value = currentAudio.currentTime; // 現在の再生位置を反映
  updateProgressColor();
});

  //全曲ページ
deleteModeBtn.addEventListener('click', () => {
  const songDeleteBtns = document.querySelectorAll("#all-songs-song-list li .delete-btn");

  toggleDeleteMode();

  if (isDeleteMode()) {
    songDeleteBtns.forEach(btn => {
      btn.classList.add("active");
    });
  } else {
    songDeleteBtns.forEach(btn => {
      btn.classList.remove("active");
    });
  }
});

importBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);

  for (const file of files) {
    if (!file.type.startsWith('audio/')) continue;

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);
    const path = `music/${file.name}`;

    // Preferencesから既存の曲リストを取得
    const importedSongs = getAllSongsList();

    // 既に同じ名前の曲が存在するかチェック
    const existingIndex = importedSongs.findIndex(song => song.title === file.name.replace(/\.mp3$/i, ''));

    // すでに存在する場合は確認ダイアログを表示
    if (existingIndex !== -1) {
      const shouldReplace = confirm(`「${file.name}」はすでに登録されています。ファイルを置き換えますか？`);
      if (!shouldReplace) {
        // ユーザーが「キャンセル」した場合は次のファイルへ
        continue;
      }
    }

    // ファイルをCapacitor Filesystemに保存（上書き含む）
    await Filesystem.writeFile({
      path,
      data: base64Data,
      directory: Directory.Data,
    });

    // 🧾 曲リストの更新
    if (existingIndex !== -1) {
      // 既存のデータを置き換え
      importedSongs[existingIndex] = { title: file.name.replace(/\.mp3$/i, ''), path };
    } else {
      // 新規追加
      importedSongs.push({ title: file.name.replace(/\.mp3$/i, ''), path });
    }

    // あいうえお順にソート
    importedSongs.sort((a, b) => a.title.localeCompare(b.title, 'ja'));

    // 保存
    await Preferences.set({ key: 'importedSongs', value: JSON.stringify(importedSongs) });
    loadAllSongsList();

    // 表示更新
    loadSongs(getAllSongsList());
  }

  fileInput.value = ''; // 選択リセット
});

allSongsSearchInput.addEventListener('input', () => {
  const val = allSongsSearchInput.value;
  const filtered = filterSongsByTitle(getAllSongsList(), val);

  loadSongs(filtered);

  if (val.trim() !== '') {
    allSongsSearchClearBtn.style.display = 'block';
  } else {
    allSongsSearchClearBtn.style.display = 'none';
  }
});

allSongsSearchClearBtn.addEventListener('click', () => {
  allSongsSearchInput.value = '';
  allSongsSearchInput.focus();
  allSongsSearchClearBtn.style.display = 'none';

  loadSongs(getAllSongsList());
});



allSongsSongList.addEventListener('click', (e) => {
  if (e.target.classList.contains("delete-btn")) return;

  const li = e.target.closest('li');
  const index = li.dataset.index;
  const active = document.querySelector("#all-songs-song-list li.active");

  if (currentPlaylist === getAllSongsList() && index === currentIndex) {
    toggleAudioPlay();
  } else {
    setCurrentPlaylist(getAllSongsList());
    setCurrentIndex(index);
    setAudio();
  }

  if (li && allSongsSongList.contains(li)) {
    if (active) {
      active.classList.remove("active");
    }
    li.classList.add("active");
  }
});



  //プレイリストページ
newPlaylistModalOpenBtn.addEventListener('click', () => {
  activate(newPlaylistModal);
});

newPlaylistModalCloseBtn.addEventListener('click', () => {
  deactivate(newPlaylistModal);
});

playlistList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (li && playlistList.contains(li)) {
    activate(playlistDetail);
  }
});

playlistDetailCloseBtn.addEventListener('click', () => {
  deactivate(playlistDetail);
  playlistDetail.scrollTo(0, 0);
});

playlistDetail.addEventListener('scroll', () => {
  const headerHight = playlistDetailHeader.offsetHeight;
  const offset = playlistDetailPlaylistTitle.getBoundingClientRect().top + playlistDetailPlaylistTitle.offsetHeight;
  
  if (offset <= headerHight) {
    playlistDetailHeaderTitle.style.display = "block";
  } else {
    playlistDetailHeaderTitle.style.display = "none";
  }
});

  //ミニプレーヤー
miniPlayer.addEventListener('click', (e) => {
  activate(fullPlayer);
  deactivate(miniPlayer);
});

playBtns.forEach(playBtn => {
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudioPlay();
  });
});

  //フルプレーヤー
fullPlayerCloseBtn.addEventListener('click', () => {
  deactivate(fullPlayer);
  activate(miniPlayer);
});

progressBar.addEventListener("input", () => {
  currentAudio.currentTime = progressBar.value;
  updateProgressColor();
});

  //タブ
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const targetId = tab.getAttribute("data-target");

    // タブ切り替え
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    // コンテンツ切り替え
    contents.forEach(content => {
      content.classList.toggle("active", content.id === targetId);
    });
  });
});











//関数
async function deleteSong(path) {
  try {
    // 🎵 ファイル削除
    await Filesystem.deleteFile({
      path,
      directory: Directory.Data,
    });

    // 🧾 Preferences から削除
    const importedSongs = getAllSongsList();
    const updated = importedSongs.filter(song => song.path !== path);

    await Preferences.set({
      key: 'importedSongs',
      value: JSON.stringify(updated),
    });
    await loadAllSongsList();

    // 🖥️ UI更新
    loadSongs(getAllSongsList());
  } catch (error) {
    console.error('削除に失敗しました:', error);
    alert('削除に失敗しました。');
  }
}

async function loadSongs(songs) {
  allSongsSongList.innerHTML = "";
  for (const song of songs) {
    await addSongToList(song.title, song.path);
  }
}

async function addSongToList(title, path) {
  // ファイルをBase64形式で読み込む
  const { data } = await Filesystem.readFile({
    path,
    directory: Directory.Data,
  });
  const index = findSongIndexByTitle(getAllSongsList(), title);

  const li = document.createElement('li');
  li.innerHTML = `
    <button class="delete-btn fa-solid fa-circle-minus"></button>
    <i class="icon fa-solid fa-music"></i>
    <div>
      <p class="song-title">${title}</p>
      <p class="song-length">--:--</p>
    </div>
  `;
  li.dataset.index = index;
  li.querySelector('.delete-btn').addEventListener('click', () => {
    deleteSong(path);
  });
  //削除モード中だったら削除用のUIを表示
  if (isDeleteMode()) {
    li.querySelector(".delete-btn").classList.add("active");    
  };

  // Data URLとしてAudioを生成
  const audio = new Audio(`data:audio/mp3;base64,${data}`);
  audio.addEventListener('loadedmetadata', () => {
    const minutes = Math.floor(audio.duration / 60);
    const seconds = Math.floor(audio.duration % 60);
    li.querySelector(".song-length").textContent =
      `${minutes}:${seconds.toString().padStart(2, "0")}`;
  });

  allSongsSongList.appendChild(li);
}

function toggleDeleteMode() {
  deleteModeBtn.classList.toggle("active");
}

function isDeleteMode() {
  return deleteModeBtn.classList.contains("active");
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function activate(elem) {
  elem.classList.add("active");
}

function deactivate(elem) {
  elem.classList.remove("active");
}

function toggleActive(elem) {
  elem.classList.toggle("active");
}










//起動時処理
async function initApp() {
  await loadAllSongsList();            // Preferencesから曲リストを読み込む
  loadSongs(getAllSongsList());        // 読み込み完了後に描画
}

initApp();
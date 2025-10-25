import { StorageManager } from './classes/StorageManager';
import { AudioPlayer } from "./classes/AudioPlayer";


const player = new AudioPlayer(document.getElementById("audio"));
const storage = new StorageManager();

let allSongs = [];


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
const playlistDetailHeader = document.querySelector("#playlist-detail .mini-header");
const playlistDetailHeaderTitle = document.querySelector("#playlist-detail .mini-header .playlist-title");
const playlistDetailPlaylistTitle = document.querySelector("#playlist-detail .playlist-info .playlist-title");

const miniPlayer = document.getElementById("mini-player");
const playBtns = document.querySelectorAll(".play-btn");

const fullPlayer = document.getElementById("full-player");
const fullPlayerCloseBtn = document.getElementById("full-player-close-btn");
const progressBar = document.querySelector("#full-player .progress-bar");

const tabs = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");



//関数
function togglePlayBtn() {
  playBtns.forEach(playBtn => {
    playBtn.innerHTML = "";

    if (player.audio.paused) {
      playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
    } else {
      playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    }
  });
}

function setupMiniPlayer(duration) {
  const miniPlayerTitle = miniPlayer.querySelector('.song-title');
  const miniPlayerSongLength = miniPlayer.querySelector('.song-length');

  const currentTitle = player.getCurrentTrack().title;

  miniPlayerTitle.textContent = currentTitle;
  miniPlayerSongLength.textContent = formatAudioDuration(duration);
}

function setupFullPlayer(duration) {
  const fullPlayerTitle = fullPlayer.querySelector('.song-title');
  const fullPlayerSongLength = fullPlayer.querySelector('.song-length');

  const currentTitle = player.getCurrentTrack().title;

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







//イベント
 //audioロード時
player.onLoaded = (duration) => {
  setupMiniPlayer(duration);
  setupFullPlayer(duration);
  activate(miniPlayer);
};

player.onPlay = () => {
  togglePlayBtn();
}

player.onPause = () => {
  togglePlayBtn();
};

player.onTimeUpdate = () => {
  progressBar.value = player.audio.currentTime; // 現在の再生位置を反映
  updateProgressColor();
};

  //全曲ページ
deleteModeBtn.addEventListener('click', () => {
  const songDeleteBtns = document.querySelectorAll("#all-songs-song-list .song-list__delete-button");

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
    storage.importSong(file);

    // 表示更新
    loadSongs(allSongs);
  }

  fileInput.value = ''; // 選択リセット
});

allSongsSearchInput.addEventListener('input', () => {
  const val = allSongsSearchInput.value;
  const filtered = filterSongsByTitle(allSongs, val);

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

  loadSongs(storage.loadSongs());
});



allSongsSongList.addEventListener('click', (e) => {
  if (e.target.classList.contains("delete-btn")) return;

  const li = e.target.closest('li');
  const index = li.dataset.index;
  const active = document.querySelector("#all-songs-song-list li.active");

  if (allSongs[index] === player.getCurrentTrack()) {
    player.togglePlay();
  } else {
    player.setPlaylist(allSongs);
    player.playTrack(index);
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
    player.togglePlay();
  });
});

  //フルプレーヤー
fullPlayerCloseBtn.addEventListener('click', () => {
  deactivate(fullPlayer);
  activate(miniPlayer);
});

progressBar.addEventListener("input", () => {
  player.seek(progressBar.value);
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
async function loadSongs(songs) {
  allSongsSongList.innerHTML = "";
  for (const song of songs) {
    await addSongToList(song.title, song.path);
  }
}

async function addSongToList(title, path) {
  // ファイルをBase64形式で読み込む
  const data = await storage.readFileAsBase64(path);
  const index = findSongIndexByTitle(await storage.loadSongs(), title);

  const li = document.createElement('li');
  li.classList.add("song-list__item")
  li.innerHTML = `
    <button class="song-list__delete-button fa-solid fa-circle-minus"></button>
    <i class="song-list__icon fa-solid fa-music"></i>
    <div>
      <p class="song-list__title">${title}</p>
      <p class="song-list__length">--:--</p>
    </div>
  `;
  li.dataset.index = index;
  li.querySelector('.song-list__delete-button').addEventListener('click', () => {
    storage.deleteSong(path);
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
    li.querySelector(".song-list__length").textContent =
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

function activate(elem) {
  elem.classList.add("active");
}

function deactivate(elem) {
  elem.classList.remove("active");
}










//起動時処理
async function initApp() {
  allSongs = await storage.loadSongs();
  loadSongs(allSongs);        // 読み込み完了後に描画
}

initApp();
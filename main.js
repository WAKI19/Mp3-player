import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

//関数
function active(elem) {
  elem.classList.remove("hidden");
  elem.classList.add("active");
}

function hide(elem) {
  elem.classList.remove("active");
  elem.classList.add("hidden");
}


// イベントはここにまとめる
document.addEventListener("DOMContentLoaded", () => {
  //要素取得
    //全曲ページ
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
  const playlistDetailPlaylistTitle = document.querySelector("#playlist-detail .playlist-info .playlist-title")

  const miniPlayer = document.getElementById("mini-player");

  const fullPlayer = document.getElementById("full-player");
  const fullPlayerCloseBtn = document.getElementById("full-player-close-btn");

  const tabs = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".tab-content");


  //イベント
    //全曲ページ
  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (!file.type.startsWith('audio/')) continue;

      const arrayBuffer = await file.arrayBuffer();
      const base64Data = arrayBufferToBase64(arrayBuffer);
      const safeName = file.name.replace(/[^a-zA-Z0-9_\-.]/g, '_');
      const path = `music/${safeName}`;

      // Capacitor Filesystemへ保存
      await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: Directory.Data,
      });

      // メタ情報をPreferencesに保存
      const stored = await Preferences.get({ key: 'importedSongs' });
      const importedSongs = stored.value ? JSON.parse(stored.value) : [];
      importedSongs.push({ title: file.name.replace(/\.mp3$/i, ''), path });
      await Preferences.set({ key: 'importedSongs', value: JSON.stringify(importedSongs) });

      // 表示更新
      loadSavedSongs();
    }

    fileInput.value = ''; // 選択リセット
  });

  allSongsSearchInput.addEventListener('input', () => {
    if (allSongsSearchInput.value.trim() !== '') {
      allSongsSearchClearBtn.style.display = 'block';
    } else {
      allSongsSearchClearBtn.style.display = 'none';
    }
  });

  allSongsSearchClearBtn.addEventListener('click', () => {
    allSongsSearchInput.value = '';
    allSongsSearchInput.focus();
    allSongsSearchClearBtn.style.display = 'none';
  });

  allSongsSongList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    const active = document.querySelector("#all-songs-song-list .active")

    if (li && allSongsSongList.contains(li)) {
      if (active) {
        active.classList.remove("active");
      }
      li.classList.add("active");
    }
  });

    //プレイリストページ
  newPlaylistModalOpenBtn.addEventListener('click', () => {
    active(newPlaylistModal);
  });

  newPlaylistModalCloseBtn.addEventListener('click', () => {
    hide(newPlaylistModal);
  });

  playlistList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (li && playlistList.contains(li)) {
      active(playlistDetail);
    }
  });

  playlistDetailCloseBtn.addEventListener('click', () => {
    hide(playlistDetail);
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
    if (e.target.id === "mini-player-play-pause-btn") return;
    active(fullPlayer);
    hide(miniPlayer);
  });

    //フルプレーヤー
  fullPlayerCloseBtn.addEventListener('click', () => {
    hide(fullPlayer);
    active(miniPlayer);
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
  async function loadSavedSongs() {
    const stored = await Preferences.get({ key: 'importedSongs' });
    const importedSongs = stored.value ? JSON.parse(stored.value) : [];

    // 🎵 あいうえお順にソート（titleを日本語順で比較）
    importedSongs.sort((a, b) => a.title.localeCompare(b.title, 'ja'));

    for (const song of importedSongs) {
      await addSongToList(song.title, song.path);
    }
  }

  async function addSongToList(title, path) {
    // ファイルをBase64形式で読み込む
    const { data } = await Filesystem.readFile({
      path,
      directory: Directory.Data,
    });

    const li = document.createElement('li');
    li.innerHTML = `
      <i class="icon fa-solid fa-music"></i>
      <div>
        <p class="song-title">${title}</p>
        <p class="song-length">--:--</p>
      </div>
    `;

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


  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  //起動時処理
  loadSavedSongs();
});
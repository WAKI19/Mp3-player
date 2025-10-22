import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

//グローバル変数
let allSongsList = [];


//グローバル関数
async function loadAllSongsList() {
  const stored = await Preferences.get({ key: 'importedSongs' });
  allSongsList = stored.value ? JSON.parse(stored.value) : [];

  allSongsList.sort((a, b) => a.title.localeCompare(b.title, 'ja')); //あいうえお順にソート
}

function getAllSongsList() {
  return allSongsList;
}

//曲のリストから、titleにkeywordが含まれるものだけを抽出して返す
function filterSongsByTitle(songs, keyword) {
  if (!keyword) return songs;

  // 部分一致（大文字・小文字を区別せず）
  return songs.filter(song =>
    song.title.toLowerCase().includes(keyword.toLowerCase())
  );
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
  const playlistDetailPlaylistTitle = document.querySelector("#playlist-detail .playlist-info .playlist-title")

  const miniPlayer = document.getElementById("mini-player");

  const fullPlayer = document.getElementById("full-player");
  const fullPlayerCloseBtn = document.getElementById("full-player-close-btn");

  const tabs = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".tab-content");











  //イベント
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
    const active = document.querySelector("#all-songs-song-list li.active")

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

    const li = document.createElement('li');
    li.innerHTML = `
      <button class="delete-btn fa-solid fa-circle-minus"></button>
      <i class="icon fa-solid fa-music"></i>
      <div>
        <p class="song-title">${title}</p>
        <p class="song-length">--:--</p>
      </div>
    `;
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

  function active(elem) {
    elem.classList.remove("hidden");
    elem.classList.add("active");
  }

  function hide(elem) {
    elem.classList.remove("active");
    elem.classList.add("hidden");
  }











  //起動時処理
  async function initApp() {
    await loadAllSongsList();            // Preferencesから曲リストを読み込む
    loadSongs(getAllSongsList());        // 読み込み完了後に描画
  }

  initApp();
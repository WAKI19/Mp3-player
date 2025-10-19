let savedSongs;

// イベントはここにまとめる
document.addEventListener("DOMContentLoaded", () => {
  //要素取得
    //全曲ページ
  const allSongsSearchInput = document.getElementById('all-songs-search-input');
  const allSongsSearchClearBtn = document.getElementById("all-songs-search-clear-btn");
  const fileImportBtn = document.getElementById("file-import-btn");
  const fileInput = document.getElementById("file-input");
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
    //ファイルインポートボタン押下時
  fileImportBtn.addEventListener("click", () => {
    fileInput.click();
  });

    //ファイル選択時
  fileInput.addEventListener("change", async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    for (const file of files) {
      if (file.type !== "audio/mpeg") continue;

      const title = file.name.replace(/\.[^/.]+$/, "");
      const duration = await getAudioDuration(file);
      const formattedDuration = formatDuration(duration);

      // ファイルをBase64化して保存
      const base64 = await fileToBase64(file);

      const songData = {
        title,
        duration: formattedDuration,
        base64, // ローカル再生用データ
      };

      savedSongs.push(songData);
      addSongToList(songData);
    }

    // LocalStorageに保存
    saveSongsToStorage(savedSongs);

    fileInput.value = "";
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
  function active(elem) {
    elem.classList.remove("hidden");
    elem.classList.add("active");
  }

  function hide(elem) {
    elem.classList.remove("active");
    elem.classList.add("hidden");
  }

  function addSongToList(song) {
    const li = document.createElement("li");
    li.innerHTML = `
      <i class="icon fa-solid fa-music"></i>
      <div>
        <p class="song-title">${song.title}</p>
        <p class="song-length">${song.duration}</p>
      </div>
    `;
    allSongsSongList.appendChild(li);
  }

  function renderSongList(songs) {
    allSongsSongList.innerHTML = "";
    songs.forEach(addSongToList);
  }

  function saveSongsToStorage(songs) {
    localStorage.setItem("songs", JSON.stringify(songs));
  }

  function loadSongsFromStorage() {
    const data = localStorage.getItem("songs");
    return data ? JSON.parse(data) : [];
  }

  function getAudioDuration(file) {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
      });
    });
  }

  function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file); // Base64に変換
    });
  }

  //起動時処理
  savedSongs = loadSongsFromStorage();
  renderSongList(savedSongs);
});
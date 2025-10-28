import { StorageManager } from './classes/StorageManager';
import { AudioPlayer } from "./classes/AudioPlayer";
import { PlaylistManager } from './classes/PlaylistManager';

import { AllSongsUI } from './ui/AllSongsUI';
import { MiniPlayerUI } from './ui/miniPlayerUI';
import { FullPlayerUI } from './ui/FullPlayerUI';

import { activate, findSongIndexByTitle } from './classes/Utils';
import { deactivate } from './classes/Utils';
import { filterSongsByTitle } from './classes/Utils';
import { hasSongByPath } from './classes/Utils';


const player = new AudioPlayer(document.getElementById("audio"));
const storage = new StorageManager();
const playlistManager = new PlaylistManager(storage);

const allSongsUI = new AllSongsUI(document.getElementById("all-songs"));
const miniPlayerUI = new MiniPlayerUI(document.getElementById("mini-player"));
const fullPlayerUI = new FullPlayerUI(document.getElementById("full-player"));

let allSongs = [];


//要素取得
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

const tabs = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");








//イベント
 //audioロード時
player.canPlay = () => {
  const song = player.getCurrentTrack();

  miniPlayerUI.setup(song);
  fullPlayerUI.setup(song);
  miniPlayerUI.show();
};

player.onPlay = () => {
  miniPlayerUI.setPauseBtn();
  fullPlayerUI.setPauseBtn();
  allSongsUI.highlightPlayingSong(player.getCurrentTrack());
}

player.onPause = () => {
  miniPlayerUI.setPlayBtn();
  fullPlayerUI.setPlayBtn();
};

player.onTimeUpdate = (currentTime, duration) => {
  fullPlayerUI.update(currentTime, duration);
};

player.onEnded = () => {
  player.next();
};

  //Fileインポート時
storage.onFileImport = () => {

};

  //File削除時
storage.onFileDelete = (path) => {
  if (hasSongByPath(player.currentPlaylist, path)) {
    console.log("再生中のプレイリストに削除した曲が含まれています！");
  };
};

  //全曲ページ
allSongsUI.deleteModeBtn.addEventListener('click', () => {
  allSongsUI.toggleDeleteMode();
});

allSongsUI.importBtn.addEventListener('click', () => {
  allSongsUI.fileInput.click();
});

allSongsUI.fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);

  for (const file of files) {
    await storage.importSong(file);
  }

  //全曲プレイリストを再生中だった場合、保存したファイルをプレイリストに含める
  if (player.currentPlaylist === allSongs) {
    player.setPlaylist(await storage.loadSongs());
  }

  allSongs = await storage.loadSongs();

  //表示更新
  allSongsUI.renderSongList(allSongs, storage);
  if (player.getCurrentTrack()) {
    allSongsUI.highlightPlayingSong(player.getCurrentTrack());
  }

  allSongsUI.fileInput.value = ''; // 選択リセット
});

allSongsUI.searchInput.addEventListener('input', () => {
  const val = allSongsUI.getSearchValue();
  const filtered = filterSongsByTitle(allSongs, val);

  allSongsUI.renderSongList(filtered, storage);
  allSongsUI.highlightPlayingSong(player.getCurrentTrack());

  if (val.trim() !== '') {
    allSongsUI.searchClearBtn.style.display = 'block';
  } else {
    allSongsUI.searchClearBtn.style.display = 'none';
  }
});

allSongsUI.searchClearBtn.addEventListener('click', () => {
  allSongsUI.searchInput.value = '';
  allSongsUI.searchInput.focus();
  allSongsUI.searchClearBtn.style.display = 'none';

  allSongsUI.renderSongList(allSongs, storage);
  allSongsUI.highlightPlayingSong(player.getCurrentTrack());
});

allSongsUI.songList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  const index = findSongIndexByTitle(allSongs, li.dataset.title);

  if (allSongs[index] === player.getCurrentTrack()) {
    player.togglePlay();
  } else {
    player.setPlaylist(allSongs);
    player.playTrack(index);
    allSongsUI.highlightPlayingSong(allSongs[index]);
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
miniPlayerUI.root.addEventListener('click', () => {
  fullPlayerUI.show();
  miniPlayerUI.hide();
});

miniPlayerUI.playBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  player.togglePlay();
});

  //フルプレーヤー
fullPlayerUI.closeBtn.addEventListener('click', () => {
  fullPlayerUI.hide();
  miniPlayerUI.show();
});

fullPlayerUI.progressBar.addEventListener('touchstart', () => {
  fullPlayerUI.isDragging = true;
  fullPlayerUI.expansion();
});

fullPlayerUI.progressBar.addEventListener('input', () => {
  fullPlayerUI.updateWhileDragging();
  fullPlayerUI.updateProgressColor();
});

fullPlayerUI.progressBar.addEventListener('change', () => {
  player.seek(fullPlayerUI.getProgressValue());
  // fullPlayerUI.updateWhileDragging();
});

fullPlayerUI.progressBar.addEventListener('touchend', () => {
  fullPlayerUI.isDragging = false;
  fullPlayerUI.reduction();
});

fullPlayerUI.prevBtn.addEventListener('click', () => {
  player.previous();
});

fullPlayerUI.playBtn.addEventListener('click', () => {
  player.togglePlay();
});

fullPlayerUI.nextBtn.addEventListener('click', () => {
  player.next();
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









//起動時処理
async function initApp() {
  allSongs = await storage.loadSongs();
  allSongsUI.renderSongList(allSongs, storage);       // 読み込み完了後に描画
  if (player.getCurrentTrack()) {
    allSongsUI.highlightPlayingSong(player.getCurrentTrack());
  };
}

initApp();
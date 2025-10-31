import { StorageManager } from './classes/StorageManager';
import { AudioPlayer } from "./classes/AudioPlayer";
import { PlaylistManager } from './classes/PlaylistManager';

import { ActionSheet } from './ui/ActionSheet';
import { AllSongsUI } from './ui/AllSongsUI';
import { MiniPlayerUI } from './ui/miniPlayerUI';
import { FullPlayerUI } from './ui/FullPlayerUI';
import { PlaylistUI } from './ui/PlaylistUI';
import { NewPlaylistModalUI } from './ui/NewPlaylistModalUI'; 
import { PlaylistDetailUI } from './ui/PlaylistDetailUI';
import { AddSongSheetUI } from './ui/AddSongSheetUI';

import { findSongIndexByTitle } from './classes/Utils';
import { filterSongsByTitle } from './classes/Utils';
import { hasSongByPath } from './classes/Utils';
import { EditPlaylistSheetUI } from './ui/EditPlaylistSheetUI';
import { InfoEditSheetUI } from './ui/InfoEditSheetUI';


const player = new AudioPlayer(document.getElementById("audio"));
const storage = new StorageManager();
const playlistManager = new PlaylistManager(storage);

const actionSheet = new ActionSheet();
const allSongsUI = new AllSongsUI(document.getElementById("all-songs"));
const miniPlayerUI = new MiniPlayerUI(document.getElementById("mini-player"));
const fullPlayerUI = new FullPlayerUI(document.getElementById("full-player"));
const playlistUI = new PlaylistUI(document.getElementById("playlist"));
const playlistModalUI = new NewPlaylistModalUI(document.getElementById("new-playlist-modal")); //変数名にNewを付けるとエラーになるので省略
const playlistDetailUI = new PlaylistDetailUI(document.getElementById("playlist-detail"));
const addSongSheetUI = new AddSongSheetUI(document.getElementById("add-song-sheet"));
const editPlaylistSheetUI = new EditPlaylistSheetUI(document.getElementById("edit-playlist-sheet"));
const infoEditSheetUI = new InfoEditSheetUI(document.getElementById("info-edit-sheet"));

let allSongs = [];
let playlists = [];


//要素取得
  //プレイリストページ
const tabs = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");






//イベント
// ==================================================
// 🎵　audio関係
// ==================================================
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


// ==================================================
// File操作時
// ==================================================
storage.onFileImport = () => { //Fileインポート時

};

storage.onFileDelete = (path) => { //File削除時
  if (hasSongByPath(player.currentPlaylist, path)) {
    console.log("再生中のプレイリストに削除した曲が含まれています！");
  };
};



// ==================================================
// 全画面共通
// ==================================================
document.addEventListener("click", (e) => {
  // クリックされた要素（またはその親）に .popover__btn が含まれているか確認
  const isPopoverButton = e.target.closest(".popover__btn");
  const popoverPanels = document.querySelectorAll(".popover__panel");

  if (!isPopoverButton) {
    popoverPanels.forEach(panel => {
      panel.classList.remove("active"); //popover_panelを消す
    });
  }
});


// ==================================================
// 🎵 全曲ページ
// ==================================================
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
  allSongsUI.highlightPlayingSong(player.getCurrentTrack());

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


// ==================================================
// 🎶　プレイリストページ
// ==================================================
playlistUI.modalOpenBtn.addEventListener('click', () => {
  playlistModalUI.show();
});

playlistUI.playlistList.addEventListener('click', async (e) => {
  const li = e.target.closest('li');
  if (!li) return;

  const id = li.dataset.id;
  const playlist = playlistManager.getPlaylist(id);

  if (li && playlistUI.playlistList.contains(li)) {
    await playlistDetailUI.load(playlist);
    playlistDetailUI.show();
  }
});


// ==================================================
// 🎶　プレイリストページ　＞　プレイリスト詳細ページ
// ==================================================
playlistDetailUI.backBtn.addEventListener('click', () => {
  playlistDetailUI.hide();
  playlistDetailUI.root.scrollTo(0, 0);
});

playlistDetailUI.ellipsisBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  playlistDetailUI.popoverPanel.classList.toggle("active");
});

playlistDetailUI.deleteBtn.addEventListener('click', async () => {
  const action = await actionSheet.action([{text: "プレイリストを削除", value: "delete"}]);
  if (action === "delete") playlistManager.deletePlaylist(playlistDetailUI.loadingPlaylistId());
  playlistDetailUI.hide();
  playlists = await playlistManager.loadPlaylists();
  playlistUI.renderPlaylists(playlists);
});

playlistDetailUI.root.addEventListener('scroll', () => {
  const headerHight = playlistDetailUI.header.offsetHeight;
  const offset = playlistDetailUI.title.getBoundingClientRect().top + playlistDetailUI.title.offsetHeight;
  
  if (offset <= headerHight) {
    playlistDetailUI.headerTitle.style.visibility = "visible";
  } else {
    playlistDetailUI.headerTitle.style.visibility = "hidden";
  }
});

playlistDetailUI.addBtn.addEventListener('click', () => {
  addSongSheetUI.show();
});

playlistDetailUI.editBtn.addEventListener('click', () => {
  editPlaylistSheetUI.show();
});

playlistDetailUI.infoBtn.addEventListener('click', () => {
  infoEditSheetUI.show();
});



// ==================================================
// 🎶プレイリストページ　＞　プレイリスト詳細ページ　＞　曲追加シート
// ==================================================
addSongSheetUI.closeBtn.addEventListener('click', () => {
  addSongSheetUI.hide();
});


// ==================================================
// 🎶プレイリストページ　＞　プレイリスト詳細ページ　＞　プレイリスト編集シート
// ==================================================
editPlaylistSheetUI.closeBtn.addEventListener('click', () => {
  editPlaylistSheetUI.hide();
});


// ==================================================
// 🎶プレイリストページ　＞　プレイリスト詳細ページ　＞　プレイリスト情報編集シート
// ==================================================
infoEditSheetUI.closeBtn.addEventListener('click', () => {
  infoEditSheetUI.hide();
});

infoEditSheetUI.cameraBtn.addEventListener('click', () => {
  infoEditSheetUI.popoverPanel.classList.toggle("active");
});

infoEditSheetUI.imgInputTrigger.addEventListener('click', () => {
  infoEditSheetUI.imgInput.click();
});


// ==================================================
// 🎶プレイリストページ　＞　プレイリスト作成用モーダル
// ==================================================
playlistModalUI.closeBtn.addEventListener('click', () => {
  playlistModalUI.hide();
  playlistModalUI.input.value = "";
  playlistModalUI.hideErrorMessage();
});

playlistModalUI.createBtn.addEventListener('click', async () => {
  const val = playlistModalUI.input.value;

  if (val === "") {
    playlistModalUI.showErrorMessage("プレイリスト名を入力してください");
    return;
  };

  playlistManager.createPlaylist(val);

  playlistModalUI.hide();
  playlistModalUI.input.value = "";

  playlists = await playlistManager.loadPlaylists();
  playlistUI.renderPlaylists(playlists);
});


// ==================================================
// ▶️　ミニプレーヤー
// ==================================================
miniPlayerUI.root.addEventListener('click', () => {
  fullPlayerUI.show();
  miniPlayerUI.hide();
});

miniPlayerUI.playBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  player.togglePlay();
});


// ==================================================
// ▶️　フルプレーヤー
// ==================================================
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
  playlists = await playlistManager.loadPlaylists();

  allSongsUI.renderSongList(allSongs, storage);       // 読み込み完了後に描画
  allSongsUI.highlightPlayingSong(player.getCurrentTrack());

  playlistUI.renderPlaylists(playlists);
}

initApp();
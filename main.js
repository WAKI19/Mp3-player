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
import { EditPlaylistSheetUI } from './ui/EditPlaylistSheetUI';
import { InfoEditSheetUI } from './ui/InfoEditSheetUI';
import { NotificationUI } from './ui/NotificationUI';

import { findSongIndexByTitle } from './classes/Utils';
import { excludeSongs } from './classes/Utils';
import { fileToBase64 } from './classes/Utils';


const player = new AudioPlayer(document.getElementById("audio"));
const storage = new StorageManager();
const playlistManager = new PlaylistManager(storage);

const actionSheet = new ActionSheet();
const notificationUI = new NotificationUI();
const allSongsUI = new AllSongsUI(document.getElementById("all-songs"));
const miniPlayerUI = new MiniPlayerUI();
const fullPlayerUI = new FullPlayerUI();
const playlistUI = new PlaylistUI(document.getElementById("playlist"));
const playlistModalUI = new NewPlaylistModalUI(); //変数名にNewを付けるとエラーになるので省略
const playlistDetailUI = new PlaylistDetailUI(document.getElementById("playlist-detail"));
const addSongSheetUI = new AddSongSheetUI(document.getElementById("add-song-sheet"));
const editPlaylistSheetUI = new EditPlaylistSheetUI(document.getElementById("edit-playlist-sheet"));
const infoEditSheetUI = new InfoEditSheetUI(document.getElementById("info-edit-sheet"));


const tabs = document.querySelectorAll(".TabBar__btn");
const contents = document.querySelectorAll(".tab-content");

let loadedSongs = [];





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
  const id = playlistDetailUI.loadingPlaylistId();
  if (player.currentPlaylistId === id) playlistDetailUI.setPauseBtn();
  miniPlayerUI.setPauseBtn();
  fullPlayerUI.setPauseBtn();
  allSongsUI.highlightPlayingSong(player.currentSongTitle);
  playlistDetailUI.highlightPlayingSong(player.currentSongTitle);
  allSongsUI.startWave();
  playlistDetailUI.startWave();
  fullPlayerUI.startRecordAnimation();
}

player.onPause = () => {
  const id = playlistDetailUI.loadingPlaylistId();
  if (player.currentPlaylistId === id) playlistDetailUI.setPlayBtn();
  miniPlayerUI.setPlayBtn();
  fullPlayerUI.setPlayBtn();
  allSongsUI.stopWave();
  playlistDetailUI.stopWave();
  fullPlayerUI.stopRecordAnimation();
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

storage.onFileDelete = async (path, filename) => { //File削除時
  const existingIndex = loadedSongs.findIndex(s => s.path === path);
  loadedSongs.splice(existingIndex, 1);

  //削除時に全曲リストで曲を聴いていた場合、セットリストを更新
  if (player.getCurrentTrack() && player.currentPlaylistId === null) {
    player.setSetList(loadedSongs);
  };

  notificationUI.notify(`${filename}を削除しました`, "normal");
};



// ==================================================
// 全画面共通
// ==================================================
document.addEventListener("click", (e) => {
  // クリックされた要素（またはその親）に .popover__btn が含まれているか確認
  const isPopoverButton = e.target.closest(".PopoverList__btn");
  const popoverPanels = document.querySelectorAll(".PopoverList__panel");

  if (!isPopoverButton) {
    popoverPanels.forEach(panel => {
      panel.classList.remove("-opened"); //popover_panelを消す
    });
  }
});


// ==================================================
// 🎵 全曲ページ
// ==================================================
allSongsUI.deleteModeBtn.addEventListener('click', () => {
  allSongsUI.toggleDeleteMode();
});

allSongsUI.importBtn.addEventListener('click', (e) => {
  allSongsUI.importPopoverPanel.classList.toggle("-opened");
});

allSongsUI.importTrigger.addEventListener('click', () => {
  allSongsUI.fileInput.click();
});

allSongsUI.fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);

  for (const file of files) {
    const newSong = await storage.importSong(file);
    const existingIndex = loadedSongs.findIndex(s => s.title === newSong.title);

    if (existingIndex !== -1) {
      loadedSongs[existingIndex] = newSong;
    } else {
      loadedSongs.push(newSong);
      allSongsUI.renderSong(newSong, storage);
    }
    loadedSongs.sort((a, b) => a.title.localeCompare(b.title, 'ja'));

    //全曲プレイリストを再生中だった場合、セットリストをセットしなおす
    if (player.currentPlaylistId === null && player.getCurrentTrack()) {
      player.setSetList(loadedSongs);
    }
  }

  allSongsUI.fileInput.value = ''; // 選択リセット
});

allSongsUI.searchInput.addEventListener('input', () => {
  const val = allSongsUI.getSearchValue();
  allSongsUI.filterList(val);

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

  allSongsUI.filterList("");
});

allSongsUI.songList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  const index = findSongIndexByTitle(loadedSongs, li.dataset.title);

  player.unsetPlaylist();
  player.setSetList(loadedSongs);

  if (li.dataset.title === player.currentSongTitle) {
    player.togglePlay();
  } else {
    player.playTrack(index);
  }
});


// ==================================================
// 🎶　プレイリストページ
// ==================================================
playlistUI.modalOpenBtn.addEventListener('click', () => {
  playlistModalUI.open();
});

playlistUI.playlistList.addEventListener('click', async (e) => {
  const li = e.target.closest('li');
  if (!li) return;

  const id = li.dataset.id;
  const playlist = playlistManager.getPlaylist(id);

  if (li && playlistUI.playlistList.contains(li)) {
    await playlistDetailUI.init(playlist);
    playlistDetailUI.highlightPlayingSong(player.currentSongTitle);
    playlistDetailUI.show();
  }
});


// ==================================================
// 🎶プレイリストページ　＞　プレイリスト作成用モーダル
// ==================================================
playlistModalUI.closeBtn.addEventListener('click', () => {
  playlistModalUI.close();
});

playlistModalUI.input.addEventListener('input', () => {
  const val = playlistModalUI.input.value;
  if (val === "") {
    playlistModalUI.deactivateCreateBtn();
  } else {
    playlistModalUI.activateCreateBtn();
  }
});

playlistModalUI.createBtn.addEventListener('click', async () => {
  const name = playlistModalUI.input.value;
  playlistManager.createPlaylist(name);

  playlistModalUI.close();

  const playlists = await playlistManager.loadPlaylists();
  playlistUI.renderPlaylists(playlists);
});


// ==================================================
// 🎶　プレイリストページ　＞　プレイリスト詳細ページ
// ==================================================
playlistDetailUI.backBtn.addEventListener('click', () => {
  const playlists = playlistManager.getAllPlaylists();

  playlistDetailUI.hide();
  playlistUI.renderPlaylists(playlists);
  playlistDetailUI.root.scrollTo(0, 0);
});

playlistDetailUI.ellipsisBtn.addEventListener("click", (e) => {
  playlistDetailUI.popoverPanel.classList.toggle("-opened");
});

playlistDetailUI.deleteBtn.addEventListener('click', async () => {
  const action = await actionSheet.action("このプレイリストを削除しますか？", [{text: "プレイリストを削除", value: "delete", type: "danger"}]);
  if (action === "delete") playlistManager.deletePlaylist(playlistDetailUI.loadingPlaylistId());

  playlistDetailUI.hide();
  const playlists = await playlistManager.loadPlaylists();
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
  const playlist = playlistManager.getPlaylist(playlistDetailUI.loadingPlaylistId());
  const songs = excludeSongs(loadedSongs, playlist.songs);

  addSongSheetUI.renderSongs(songs, playlistManager);
  addSongSheetUI.show();
});

playlistDetailUI.editBtn.addEventListener('click', () => {
  const playlist = playlistManager.getPlaylist(playlistDetailUI.loadingPlaylistId());
  const songs = playlist.songs;

  editPlaylistSheetUI.renderSongs(songs, playlistManager);
  editPlaylistSheetUI.show();
});

playlistDetailUI.infoBtn.addEventListener('click', () => {
  const playlist = playlistManager.getPlaylist(playlistDetailUI.loadingPlaylistId());
  infoEditSheetUI.setup(playlist);
  infoEditSheetUI.show();
  if (infoEditSheetUI.value === "") infoEditSheetUI.saveBtn.classList.add("-disabled");
});

playlistDetailUI.playBtn.addEventListener('click', async () => {
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist =  playlistManager.getPlaylist(id);

  if (player.currentPlaylistId === id && player.getCurrentTrack()) {
    player.togglePlay();
  } else {
    player.setPlaylist(playlist);
    await player.playTrack(0);
  }
});

playlistDetailUI.songList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist = playlistManager.getPlaylist(id);
  const index = findSongIndexByTitle(playlist.songs, li.dataset.title);

  player.setPlaylist(playlist);

  if (player.currentPlaylistId === id && player.currentSongTitle === li.dataset.title) {
    player.togglePlay();
  } else {
    player.playTrack(index);
  }
});



// ==================================================
// 🎶プレイリストページ　＞　プレイリスト詳細ページ　＞　曲追加シート
// ==================================================
addSongSheetUI.closeBtn.addEventListener('click', () => {
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist = playlistManager.getPlaylist(id);

  playlistDetailUI.init(playlist);
  addSongSheetUI.hide();
});

addSongSheetUI.searchInput.addEventListener('input', async () => {
  const val = addSongSheetUI.getSearchValue();
  addSongSheetUI.filterList(val);

  if (val.trim() !== '') {
    addSongSheetUI.searchClearBtn.style.display = 'block';
  } else {
    addSongSheetUI.searchClearBtn.style.display = 'none';
  }
});

addSongSheetUI.searchClearBtn.addEventListener('click', async () => {
  addSongSheetUI.searchInput.value = '';
  addSongSheetUI.searchInput.focus();
  addSongSheetUI.searchClearBtn.style.display = 'none';
  addSongSheetUI.filterList("");
});


// ==================================================
// 🎶プレイリストページ　＞　プレイリスト詳細ページ　＞　プレイリスト編集シート
// ==================================================
editPlaylistSheetUI.closeBtn.addEventListener('click', () => {
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist = playlistManager.getPlaylist(id);

  playlistDetailUI.init(playlist);
  editPlaylistSheetUI.hide();
});

editPlaylistSheetUI.searchInput.addEventListener('input', () => {
  const val = editPlaylistSheetUI.getSearchValue();
  editPlaylistSheetUI.filterList(val);

  if (val.trim() !== '') {
    editPlaylistSheetUI.searchClearBtn.style.display = 'block';
  } else {
    editPlaylistSheetUI.searchClearBtn.style.display = 'none';
  }
});

editPlaylistSheetUI.searchClearBtn.addEventListener('click', () => {
  editPlaylistSheetUI.searchInput.value = '';
  editPlaylistSheetUI.searchInput.focus();
  editPlaylistSheetUI.searchClearBtn.style.display = 'none';
  editPlaylistSheetUI.filterList("");
});


// ==================================================
// 🎶プレイリストページ　＞　プレイリスト詳細ページ　＞　プレイリスト情報編集シート
// ==================================================
infoEditSheetUI.closeBtn.addEventListener('click', async () => {
  const action = await actionSheet.action("プレイリストに加えた変更を破棄しますか？", [{text: "変更を破棄", value: "discard", type: "danger"}]);
  if (action === "discard") infoEditSheetUI.hide();

  infoEditSheetUI.saveBtn.classList.remove("-disabled");
});

infoEditSheetUI.saveBtn.addEventListener('click', async () => {
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist = playlistManager.getPlaylist(id);
  const file = infoEditSheetUI.getImgFile();
  
  if (file) await playlistManager.setImage(id, file);
  await playlistManager.renamePlaylist(id, infoEditSheetUI.nameInput.value);
  
  playlistDetailUI.init(playlist);
  infoEditSheetUI.hide();
});

infoEditSheetUI.cameraBtn.addEventListener('click', () => {
  infoEditSheetUI.popoverPanel.classList.toggle("-opened");
});

infoEditSheetUI.imgInputTrigger.addEventListener('click', () => {
  infoEditSheetUI.imgInput.click();
});

infoEditSheetUI.imgInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const base64 = await fileToBase64(file);

  infoEditSheetUI.img.src = base64;
});

infoEditSheetUI.nameInput.addEventListener('input', () => {
  if (infoEditSheetUI.nameInput.value === "") {
    infoEditSheetUI.saveBtn.classList.add("-disabled");
  } else {
    infoEditSheetUI.saveBtn.classList.remove("-disabled");
  }
});


// ==================================================
// ▶️　ミニプレーヤー
// ==================================================
miniPlayerUI.root.addEventListener('click', () => {
  fullPlayerUI.open();
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
  fullPlayerUI.close();
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
  loadedSongs = await storage.loadSongs();
  allSongsUI.renderSongList(loadedSongs, storage);
  
  const playlists = await playlistManager.loadPlaylists();
  playlistUI.renderPlaylists(playlists);
}

initApp();
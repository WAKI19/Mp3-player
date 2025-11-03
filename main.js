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
import { filterSongsByTitle } from './classes/Utils';
import { hasSongByPath } from './classes/Utils';
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


//要素取得
  //プレイリストページ
const tabs = document.querySelectorAll(".TabBar__btn");
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
  const id = playlistDetailUI.loadingPlaylistId();
  if (player.currentPlaylistId === id) playlistDetailUI.setPauseBtn();
  miniPlayerUI.setPauseBtn();
  fullPlayerUI.setPauseBtn();
  allSongsUI.highlightPlayingSong(player.getCurrentTrack());
  allSongsUI.startWave();
}

player.onPause = () => {
  const id = playlistDetailUI.loadingPlaylistId();
  if (player.currentPlaylistId === id) playlistDetailUI.setPlayBtn();
  miniPlayerUI.setPlayBtn();
  fullPlayerUI.setPlayBtn();
  allSongsUI.stopWave();
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
  if (hasSongByPath(player.setList, path)) {
    
    if (player.currentPlaylistId) {
      const playlist = playlistManager.getPlaylist(player.currentPlaylistId);
      player.setPlaylist(playlist);
    } else {
      const allsongs = await storage.loadSongs();
      player.setSetList(allsongs);
    }

  };

  notificationUI.notify(`${filename}を削除しました`, "normal");
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
  if (player.currentPlaylistId === null) {
    player.setSetList(await storage.loadSongs());
  }

  //表示更新
  allSongsUI.renderSongList(await storage.loadSongs(), storage);
  allSongsUI.highlightPlayingSong(player.getCurrentTrack());

  allSongsUI.fileInput.value = ''; // 選択リセット
});

allSongsUI.searchInput.addEventListener('input', async () => {
  const allSongs = await storage.loadSongs();
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

allSongsUI.searchClearBtn.addEventListener('click', async () => {
  const allSongs = await storage.loadSongs();
  allSongsUI.searchInput.value = '';
  allSongsUI.searchInput.focus();
  allSongsUI.searchClearBtn.style.display = 'none';

  allSongsUI.renderSongList(allSongs, storage);
  allSongsUI.highlightPlayingSong(player.getCurrentTrack());
});

allSongsUI.songList.addEventListener('click', async (e) => {
  const li = e.target.closest('li');
  const allSongs = await storage.loadSongs();
  const index = findSongIndexByTitle(allSongs, li.dataset.title);

  if (player.getCurrentTrack() && allSongs[index].title === player.getCurrentTrack().title) {
    player.togglePlay();
  } else {
    player.unsetPlaylist();
    player.setSetList(allSongs);
    player.playTrack(index);
    allSongsUI.highlightPlayingSong(allSongs[index]);
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
    playlistDetailUI.init(playlist);
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
  e.stopPropagation();
  playlistDetailUI.popoverPanel.classList.toggle("active");
});

playlistDetailUI.deleteBtn.addEventListener('click', async () => {
  const action = await actionSheet.action([{text: "プレイリストを削除", value: "delete", type: "danger"}]);
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

playlistDetailUI.addBtn.addEventListener('click', async () => {
  const allSongs = await storage.loadSongs();
  const playlist = playlistManager.getPlaylist(playlistDetailUI.loadingPlaylistId());
  const songs = excludeSongs(allSongs, playlist.songs);

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

  if (player.getCurrentTrack() && player.currentPlaylistId === id && player.getCurrentTrack().title === playlist.songs[index].title) {
    player.togglePlay();
  } else {
    player.setPlaylist(playlist);
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
  const allSongs = await storage.loadSongs();
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist = playlistManager.getPlaylist(id);
  const notAdded = excludeSongs(allSongs, playlist.songs);
  const val = addSongSheetUI.getSearchValue();
  const filtered = filterSongsByTitle(notAdded, val);
  addSongSheetUI.renderSongs(filtered, playlistManager);

  if (val.trim() !== '') {
    addSongSheetUI.searchClearBtn.style.display = 'block';
  } else {
    addSongSheetUI.searchClearBtn.style.display = 'none';
  }
});

addSongSheetUI.searchClearBtn.addEventListener('click', async () => {
  const allSongs = await storage.loadSongs();
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist = playlistManager.getPlaylist(id);
  const filtered = excludeSongs(allSongs, playlist.songs);

  addSongSheetUI.searchInput.value = '';
  addSongSheetUI.searchInput.focus();
  addSongSheetUI.searchClearBtn.style.display = 'none';
  addSongSheetUI.renderSongs(filtered, playlistManager);
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
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist = playlistManager.getPlaylist(id);
  const val = editPlaylistSheetUI.getSearchValue();
  const filtered = filterSongsByTitle(playlist.songs, val);
  editPlaylistSheetUI.renderSongs(filtered, playlistManager);

  if (val.trim() !== '') {
    editPlaylistSheetUI.searchClearBtn.style.display = 'block';
  } else {
    editPlaylistSheetUI.searchClearBtn.style.display = 'none';
  }
});

editPlaylistSheetUI.searchClearBtn.addEventListener('click', () => {
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist = playlistManager.getPlaylist(id);

  editPlaylistSheetUI.searchInput.value = '';
  editPlaylistSheetUI.searchInput.focus();
  editPlaylistSheetUI.searchClearBtn.style.display = 'none';
  editPlaylistSheetUI.renderSongs(playlist.songs, playlistManager);
});


// ==================================================
// 🎶プレイリストページ　＞　プレイリスト詳細ページ　＞　プレイリスト情報編集シート
// ==================================================
infoEditSheetUI.closeBtn.addEventListener('click', () => {
  infoEditSheetUI.hide();
});

infoEditSheetUI.saveBtn.addEventListener('click', async () => {
  const file = infoEditSheetUI.getImgFile();
  
  if (file) await playlistManager.setImage(playlistDetailUI.loadingPlaylistId(), file);
  await playlistManager.renamePlaylist(playlistDetailUI.loadingPlaylistId(), infoEditSheetUI.nameInput.value);
  
  const id = playlistDetailUI.loadingPlaylistId();
  const playlist = playlistManager.getPlaylist(id);
  playlistDetailUI.init(playlist);
  infoEditSheetUI.hide();
});

infoEditSheetUI.cameraBtn.addEventListener('click', () => {
  infoEditSheetUI.popoverPanel.classList.toggle("active");
});

infoEditSheetUI.imgInputTrigger.addEventListener('click', () => {
  infoEditSheetUI.imgInput.click();
});

infoEditSheetUI.imgInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const base64 = await fileToBase64(file);

  infoEditSheetUI.img.src = base64;
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
  const allSongs = await storage.loadSongs();
  allSongsUI.renderSongList(allSongs, storage);
  allSongsUI.highlightPlayingSong(player.getCurrentTrack());  
  
  const playlists = await playlistManager.loadPlaylists();
  playlistUI.renderPlaylists(playlists);
}

initApp();
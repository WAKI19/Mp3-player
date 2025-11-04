import { BaseUI } from "./BaseUI";

import { NotificationUI } from "./NotificationUI";
import { formatAudioDuration } from "../classes/Utils";

const notificationUI = new NotificationUI();

export class AddSongSheetUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".bottom-sheet__close-btn");
        this.searchInput = root.querySelector(".SearchBox__input");
        this.searchClearBtn = root.querySelector(".SearchBox__clear-btn");
        this.songList = root.querySelector(".song-list");
    }

    renderSongs(songs, playlistManager) {
        this.songList.innerHTML = "";

        songs.forEach(song => {
            const li = document.createElement('li');
            li.classList.add("song-list__item");
            li.innerHTML = `
                <i class="song-list__icon fa-solid fa-music"></i>
                <div class="song-list__info">
                    <p class="song-list__title">${song.title}</p>
                    <p class="song-list__length">${formatAudioDuration(song.duration)}</p>
                </div>
                <button class="song-list__add-btn"><i class="fa-solid fa-plus"></i></button>
            `;
            li.dataset.title = song.title;

            li.querySelector(".song-list__add-btn").addEventListener('click', async () => {
                const playlistId = document.getElementById("playlist-detail").dataset.id;

                li.classList.add("added");
                setTimeout(() => li.remove(), 250);
                await playlistManager.addSongToPlaylist(playlistId, song);
                notificationUI.notify(`「${song.title}」を追加しました`, "normal");
            });

            this.songList.appendChild(li);
        });
    }

    getSearchValue() {
        return this.searchInput.value;
    }
}
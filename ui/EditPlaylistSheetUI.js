import { BaseUI } from "./BaseUI";

import { formatAudioDuration } from "../classes/Utils";

export class EditPlaylistSheetUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".bottom-sheet__close-btn");
        this.searchInput = root.querySelector(".search-box__input");
        this.searchClearBtn = root.querySelector(".search-box__clear-btn");
        this.songList = root.querySelector(".song-list");
    }

    renderSongs(songs, playlistManager) {
        this.songList.innerHTML = "";

        songs.forEach(song => {
            const li = document.createElement('li');
            li.classList.add("song-list__item");
            li.innerHTML = `
                <i class="song-list__icon fa-solid fa-music"></i>
                <div>
                    <p class="song-list__title">${song.title}</p>
                    <p class="song-list__length">${formatAudioDuration(song.duration)}</p>
                </div>
                <button class="song-list__remove-btn"><i class="fa-solid fa-circle-minus"></i></button>
            `;
            li.dataset.title = song.title;
            li.addEventListener('transitionend', function handler(e) {
                // transform か opacity のどちらかが完了した時点でOK
                if (e.propertyName === 'transform') {
                    li.style.display = 'none'; // ← 完全に領域を消す
                    li.removeEventListener('transitionend', handler);
                }
            });

            li.querySelector(".song-list__remove-btn").addEventListener('click', async () => {
                const playlistId = document.getElementById("playlist-detail").dataset.id;

                li.classList.add("removed");
                await playlistManager.removeSongFromPlaylist(playlistId, song.title);
            });

            this.songList.appendChild(li);
        });
    }

    getSearchValue() {
        return this.searchInput.value;
    }
}
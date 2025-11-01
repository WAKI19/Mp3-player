import { BaseUI } from "./BaseUI";

import { formatAudioDuration } from "../classes/Utils";

export class AddSongSheetUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".bottom-sheet__close-btn");
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
                <button class="song-list__add-btn"><i class="fa-solid fa-plus"></i></button>
            `;
            li.dataset.title = song.title;
            li.addEventListener('transitionend', function handler(e) {
                // transform か opacity のどちらかが完了した時点でOK
                if (e.propertyName === 'transform') {
                    li.style.display = 'none'; // ← 完全に領域を消す
                    li.removeEventListener('transitionend', handler);
                }
            });

            li.querySelector(".song-list__add-btn").addEventListener('click', async () => {
                const playlistId = document.getElementById("playlist-detail").dataset.id;

                li.classList.add("added");
                await playlistManager.addSongToPlaylist(playlistId, song);
            });

            this.songList.appendChild(li);
        });
    }
}
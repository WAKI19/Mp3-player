import { BaseUI } from "./BaseUI";

export class PlaylistUI extends BaseUI {
    constructor(root) {
        super(root);
        this.modalOpenBtn = root.querySelector("#modal-open-btn");
        this.playlistList = root.querySelector(".playlist-list");
    }

    renderPlaylists(playlists) {
        this.playlistList.innerHTML = "";

        playlists.forEach(playlist => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="playlist-list__img"></div>
                <p class="playlist-list__name">${playlist.name}</p>
            `;
            li.dataset.id = playlist.id;

            this.playlistList.appendChild(li);
        });
    }
}
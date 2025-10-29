import { BaseUI } from "./BaseUI";

export class PlaylistDetailUI extends BaseUI{
    constructor(root) {
        super(root);
        this.backBtn = root.querySelector(".playlist-detail__back-btn");
        this.header = root.querySelector(".playlist-detail__header");
        this.headerTitle = root.querySelector(".playlist-detail__header .playlist-detail__title");
        this.length = root.querySelector(".playlist-detail__length");
        this.title = root.querySelector(".playlist-detail__info .playlist-detail__title");
    }

    async load(playlist) {
        this.headerTitle.textContent = playlist.name;
        this.title.textContent = playlist.name;
        this.length.textContent = `${playlist.songs.length}曲、 -時間--分`;
    }
}
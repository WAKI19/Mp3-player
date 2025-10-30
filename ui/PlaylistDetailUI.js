import { BaseUI } from "./BaseUI";

export class PlaylistDetailUI extends BaseUI{
    constructor(root) {
        super(root);
        this.backBtn = root.querySelector(".playlist-detail__back-btn");
        this.header = root.querySelector(".playlist-detail__header");
        this.headerTitle = root.querySelector(".playlist-detail__header .playlist-detail__title");
        this.ellipsisBtn = root.querySelector("#playlist-detail__popover .popover__btn");
        this.popoverPanel = root.querySelector("#playlist-detail__popover .popover__panel");
        this.deleteBtn = root.querySelector("#playlist-detail__delete-btn");
        this.length = root.querySelector(".playlist-detail__length");
        this.title = root.querySelector(".playlist-detail__info .playlist-detail__title");
        this.addBtn = root.querySelector(".playlist-detail__action--add");
        this.editBtn = root.querySelector(".playlist-detail__action--edit");
        this.infoBtn = root.querySelector(".playlist-detail__action--info");
    }

    async load(playlist) {
        this.headerTitle.textContent = playlist.name;
        this.title.textContent = playlist.name;
        this.length.textContent = `${playlist.songs.length}曲、 -時間--分`;
    }
}
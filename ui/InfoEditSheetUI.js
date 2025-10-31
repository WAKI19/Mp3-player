import { BaseUI } from "./BaseUI";

export class InfoEditSheetUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".bottom-sheet__close-btn");
        this.saveBtn = root.querySelector(".bottom-sheet__action-btn");
        this.cameraBtn = root.querySelector("#info-edit__camera-btn");
        this.popoverPanel = root.querySelector(".popover__panel");
        this.imgInputTrigger = root.querySelector("#img-input-trigger");
        this.imgInput = root.querySelector("#playlist-img-input");
        this.nameInput = root.querySelector("#playlist-name-input");
    }

    setup(playlist) {
        this.nameInput.value = playlist.name;
    }
}
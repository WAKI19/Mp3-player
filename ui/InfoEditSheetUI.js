import { BaseUI } from "./BaseUI";

export class InfoEditSheetUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".bottom-sheet__close-btn");
    }
}
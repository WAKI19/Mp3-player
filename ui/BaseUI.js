export class BaseUI {
    constructor(root) {
        this.root = root;
    }

    show() {
        this.root.classList.add("active");
    }

    hide() {
        this.root.classList.remove("active");
    }
}
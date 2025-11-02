export class NotificationUI {
    constructor() {
        this.root = document.querySelector(".Notification");
        this.textarea = this.root.querySelector(".Notification__textarea");
    }

    notify(text, type) {
        this.init();
        this.textarea.innerText = text;
        this.type(type);
        this.show();
    }

    type(type) {
        switch(type) {
            case "normal":
                this.root.classList.add("-normal");
                break;
            case "error":
                this.root.classList.add("-error");
                break;
            default:
                this.root.classList.add("-normal");
        }
    }

    show() {
        this.root.classList.add("-active");
        setTimeout(() => {
            this.root.classList.remove("-active");
        }, 2500);
    }

    init() {
        this.root.classList.forEach(c => {
            if (c !== "Notification"){
                this.root.classList.remove(c); //Notification以外のクラスをすべて削除
            }
        });
    }
}
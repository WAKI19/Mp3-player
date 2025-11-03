export class ActionSheet {
    constructor() {
        this.backdrop = document.querySelector(".ActionSheetBackdrop");
        this.sheet = document.querySelector(".ActionSheet");
        this.actions = this.sheet.querySelector(".ActionSheet__actions");
        this.cancelBtn = this.sheet.querySelector(".ActionSheet__cancel");

        // クリックすると閉じる
        this.backdrop.addEventListener('click', () => {
            this.sheet.classList.remove('-opened');
            this.backdrop.classList.remove('-opened');
        });
    }

    async action(btns) { //btns [{text: "ボタンのテキスト", value: "value", type: "type"}, {}, {}]
        this.generateBtns(btns);
        this.open();

        const selectedValue = await this.waitInput();
        return selectedValue;
    }

    generateBtns(btns) {
        this.actions.innerHTML = "";

        btns.forEach(btn => {
            const btnElem = document.createElement("button");
            btnElem.classList.add("ActionSheet__btn", "ActionSheet__action");
            if (btn.type === "danger") btnElem.classList.add("-danger");
            btnElem.textContent = btn.text;
            btnElem.value = btn.value;

            this.actions.appendChild(btnElem);
        });
    }

    waitInput = () => new Promise((resolve) => {
        this.actions.addEventListener('click', (e) => {
            resolve(e.target.value);
        });
    });

    open() {
        this.backdrop.classList.add("-opened");
        this.sheet.classList.add("-opened");
    }

    close() {
        this.backdrop.classList.remove("-opened");
        this.sheet.classList.remove("-opened");
    }
}
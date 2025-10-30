export class ActionSheet {
    constructor() {
        this.backdrop = document.getElementById("actionSheetBackdrop");
        this.sheet = document.getElementById("actionSheet");
        this.actions = this.sheet.querySelector(".action-sheet__actions");
        this.btns = this.sheet.querySelectorAll(".action-sheet__btn");
        this.cancelBtn = this.sheet.querySelector(".action-sheet__cancel");

        // クリックすると閉じる
        this.backdrop.addEventListener('click', () => {
            this.sheet.classList.remove('active');
            this.backdrop.classList.remove('active');
        });
    }

    async action(btns) { //btns [{text: "ボタンのテキスト", value: "value"}, {}, {}]
        this.generateBtns(btns);
        this.show();

        const selectedValue = await this.waitInput();
        return selectedValue;
    }

    generateBtns(btns) {
        this.actions.innerHTML = "";

        btns.forEach(btn => {
            const btnElem = document.createElement("button");
            btnElem.classList.add("action-sheet__btn");
            btnElem.textContent = btn.text;
            btnElem.value = btn.value;

            this.actions.appendChild(btnElem);
        });
    }

    waitInput = () => new Promise(resolve => this.sheet.querySelector(".action-sheet__btn").addEventListener("click",  (e) => {
        resolve(e.target.value);
    }));

    show() {
        this.backdrop.classList.add("active");
        this.sheet.classList.add("active");
    }
}
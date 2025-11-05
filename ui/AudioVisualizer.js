export class AudioVisualizer {
    constructor(canvas, flashTarget) {
        this.audio = document.getElementById("audio");

        this.ctx = canvas.getContext('2d');
        this.barColor = "#3dd6b0";
        this.WIDTH = canvas.width;
        this.HEIGHT = canvas.height;

        this.audioCtx;
        this.analyser;
        this.source;
        this.dataArray;
        this.rafId;

        this.flashTarget = flashTarget;
        this.flashIntensity = 0;

        this.audio.addEventListener("play", () => {
            if (!this.audioCtx) this.setupAudio();
            if (this.audioCtx.state === "suspended") this.audioCtx.resume();
            this.draw();
        });

        this.audio.addEventListener("pause", () => cancelAnimationFrame(this.rafId));
    }

    setupAudio() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.7;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        this.source = this.audioCtx.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
    }

    draw() {
        this.analyser.getByteFrequencyData(this.dataArray);

        // -------------------------------
        // 💡 音量に応じて発光させる処理
        // -------------------------------
        if (this.flashTarget) {
            const avg = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
            const normalized = avg / 255; // 0〜1 に正規化
            const target = Math.pow(normalized, 3.1); // カーブをかけて自然な光り方に
            this.flashIntensity += (target - this.flashIntensity) * 0.2; // スムーズ補間

            const glow = Math.floor(this.flashIntensity * 1500); // 最大200pxくらい
            this.flashTarget.style.boxShadow = `0 0 ${glow}px ${this.barColor}`;
        }

        this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        const barCount = 64;
        const barWidth = this.WIDTH / barCount;

        for (let i = 0; i < barCount; i++) {
            const value = this.dataArray[i] / 255;
            const emphasized = Math.pow(value, 2.5);

            // 🎛 谷型 + 高音ブースト
            const pos = i / (barCount - 1);
            const valleyCurve = 1.2 - Math.pow((pos - 0.5) * 2, 2);
            const highBoost = 1 + pos * 0.8;
            const barHeight = emphasized * (this.HEIGHT*0.8) * valleyCurve * highBoost;

            const x = i * barWidth;
            const y = this.HEIGHT - barHeight;

            // 🎨 グラデーション（Y=400~200:ベース, Y=200~0:白へ）
            const grad = this.ctx.createLinearGradient(0, 0, 0, this.HEIGHT);
            grad.addColorStop(0, "#ffffff"); // 上端：白
            grad.addColorStop(0.5, "#ffffff");
            grad.addColorStop(1, this.barColor);   // 下端もベースカラー

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(x, y, barWidth - 2, barHeight);
        }

        this.rafId = requestAnimationFrame(() => this.draw());
    }
}
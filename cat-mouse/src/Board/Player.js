import { getSound, getCached } from '../resources';

class Player {
    recording = false;
    queue = [];
    pos = [];
    times = [];

    constructor() {
        this.play = this.play.bind(this);
    }

    play(key, num=1, pos=-1) {
        const sound = getSound(key);
        if (!sound) return;
        
        const cached = getCached(key);
        if (cached.paused || !cached.currentTime || !cached.duration) {
            cached.play();
        } else {
            const audio = new Audio(sound);
            audio.onended = audio.remove;
            audio.play();
        }

        if (this.recording) {
            this.queue.push(key);
            this.pos.push(pos > -1 ? pos : key);
            this.times.push((new Date()).getTime());
        }

        if (num > 1) {
            for (let i = 0; i <  num; i++) {
                setTimeout(() => this.play(key), i * 250)
            }
        }
    }

    playRecording(initCallback = null, endCallback = null, speed = 1) {
        const playback = (i) => {
            const key = this.queue[i];
            if (initCallback) initCallback(this.pos[i]);

            this.play(key);

            if (this.times.length - 1 === i) {
                if (endCallback) setTimeout(endCallback, getCached(key).duration * 1000);
            } else {
                const next = Math.floor(this.times[i + 1] - this.times[i]) / speed;
                setTimeout(() => playback(i + 1), next);
            }
        }
        playback(0);
    }

    reverseRecording() {
        this.queue.reverse();
        this.times.reverse();
    }

    clearRecording() {
        this.queue = [];
        this.times = [];
    }
}

export default Player;
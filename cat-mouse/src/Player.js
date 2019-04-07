import { SOUNDS } from './constants';

class Player {
    recording = false;
    queue = [];
    times = [];

    play(key) {
        if (SOUNDS[key]) {
            const sound = SOUNDS[key];

            const audio = new Audio(sound);
            audio.onended = audio.remove;
            audio.play();
            
            if (this.recording) {
                this.queue.push(key);
                this.times.push((new Date()).getTime());
            }
        }
    }

    playRecording(initCallback = null, endCallback = null, speed = 1) {
        let start = this.times[0];
        
        for (let i = 0; i < this.queue.length; ++i) {
            const key = this.queue[i];

            const audio = new Audio(SOUNDS[key]);
            if (endCallback && i === this.queue.length - 1) {
                audio.onended = () => {
                    audio.remove();
                    endCallback();
                }
            } else {
                audio.onended = audio.remove;
            }

            const time = Math.abs(this.times[i] - start) / speed;
            setTimeout(
                () => {
                    if (initCallback) initCallback(key);
                    audio.play();
                },
            time);
        }
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
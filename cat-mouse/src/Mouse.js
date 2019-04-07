class Mouse {
    weights = [];
    position = 0;
    constructor(catPosition, totalPositions) {
        this.resetState(catPosition, totalPositions);
    }

    resetState(catPosition, totalPositions) {
        this.weights = [];
        for (let i = 0; i < totalPositions; i++) this.weights.push(totalPositions);
        this.weights[catPosition] = 0;
        this.updatePosition();
    }

    updatePosition() {
        const sum = this.weights.reduce((t, n) => t + n);
        let random = Math.floor(Math.random() * sum);

        for (let i = 0; i < this.weights.length; i++) {
            const weight = this.weights[i];
            if (random < weight) {
                this.position = i;
                this.weights[i] = 0;
                break;
            }
            random -= weight;
            if (weight < this.weights.length) {
                this.weights[i] += 1;
            }
        }
    }

    updateCat(position) {
        if (position === this.position) {
            return true;
        }
        
        this.weights[position] = 0;
        this.updatePosition();
        return false;
    }
}

export default Mouse;
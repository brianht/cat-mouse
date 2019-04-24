import React, { Component } from 'react';
import './Board.css'
import smack from '../sounds/smack.wav';
import Occupant from './Occupant';
import Player from './Player';
import Avatar from './Avatar/Avatar';
import { DEFAULT_COLOR, colors, randomizeResources, soundId, soundEnum } from '../resources';

class Board extends Component {    
    coordinateType = {
        'user': ['ux', 'uy'],
        'occupant': ['ox', 'oy']
    }

    keyMap = {
        'w': 2, 'a': 5, 's': 8,
        'd': 1, 'f': 4, 'g': 7,
        'ArrowRight': 0, 'ArrowUp': 3, 'ArrowLeft': 6
    }

    rules = {
        beckoning: 0,
        warding: 0,
        shielding: 0,
        chance: 0
    }

    rulePatterns = [
        {
            key: 'beckoning',
            patterns: [soundEnum.bell, soundEnum.creak, soundEnum.crinkle]
        },
        {
            key: 'warding',
            patterns: [soundEnum.cut, soundEnum.tear, soundEnum.splash]
        },
        {
            key: 'shielding',
            patterns: [soundEnum.indicator, soundEnum.click]
        },
        {
            key: 'chance',
            patterns: [soundEnum.spin]
        }
    ]

    orderFunc = (a, b) => a - b;

    synthetic1 = [
        {
            id: soundEnum.laser,
            pattern: [soundEnum.splash, soundEnum.crinkle, soundEnum.cut].sort(this.orderFunc)
        },
        {
            id: soundEnum.register,
            pattern: [soundEnum.bell, soundEnum.click, soundEnum.spin].sort(this.orderFunc)
        },
        {
            id: soundEnum.siren,
            pattern: [soundEnum.indicator, soundEnum.creak, soundEnum.tear].sort(this.orderFunc)
        }
    ]

    synthetic2 = [
        {
            id: soundEnum.slots,
            pattern: [soundEnum.laser, soundEnum.register].sort(this.orderFunc)
        },
        {
            id: soundEnum.violin,
            pattern: [soundEnum.register, soundEnum.siren].sort(this.orderFunc)
        },
        {
            id: soundEnum.blast,
            pattern: [soundEnum.siren, soundEnum.laser].sort(this.orderFunc)
        }
    ]

    history = [];
    synthHistory = [];

    constructor(props) {
        super(props);

        this.white = true;

        this.size = props.size;
        this.dimension = Math.ceil(Math.sqrt(this.size));
        this.center = Math.floor(this.size / 2);
        const userCoordinates = this.getXY(this.center, this.coordinateType.user);
        this.position = this.center;

        this.occupant = new Occupant(this.center, this.size);
        const occupantCoordinates = this.getXY(this.occupant.position, this.coordinateType.occupant);
        
        this.state = { color: DEFAULT_COLOR };
        Object.assign(this.state, occupantCoordinates, userCoordinates);

        this.player = new Player();
        this.player.recording = true;

        this.smack = new Audio(smack);
        this.smack.onended = () => {
            if (this.player.queue.length > 0) {
                this.player.playRecording(this.moveAvatar, this.resetState);
            } else {
                this.resetState();
            }
        }
        this.resetState = this.resetState.bind(this);
        this.moveAvatar = this.moveAvatar.bind(this);
        this.mouseListener = this.mouseListener.bind(this);
        this.keyDownListener = this.keyDownListener.bind(this);
        this.keyUpListener = this.keyUpListener.bind(this);
    }

    resetState() {
        this.moveAvatar(this.center, false);
        this.occupant.resetState(this.center, this.size);

        this.player.clearRecording();
        this.player.recording = true;

        randomizeResources();

        this.white = true;
    }

    moveAvatar(position, colorChange = true) {
        if (position < 0 || position > this.size - 1) return;
        this.position = position;

        clearTimeout(this.timer);

        const newState = { color: colorChange ? colors[position] : DEFAULT_COLOR };
        Object.assign(newState, this.getXY(position, this.coordinateType.user));
        
        this.setState(newState);

        let delay = 500;
        if (this.white) {
            if (this.updatePositions(position)) delay = 0;
        }

        this.timer = setTimeout(() => this.setState({color: DEFAULT_COLOR}), delay);
    }

    updatePositions(position) {
        const occupantPosition = this.getXY(this.occupant.position, this.coordinateType.occupant);
        this.setState(occupantPosition);

        let occupied = false;
        if (this.rules.shielding) {
            this.rules.shielding -= 1;
        } else {
            if (this.rules.chance) {
                this.occupant.resetState(this.position, this.size);
                this.rules.chance -= 1;
            }
            if (this.rules.beckoning) {
                const adj = this.getAdjacent(this.position);
                for (let i = 0; i < this.occupant.weights.length; i++) {
                    this.occupant.weights[i] = adj.includes(i) ? 1 : 0;
                }
            }
            if (this.rules.warding) {
                const adj = this.getAdjacent(this.position);
                for (let i = 0; i < this.occupant.weights.length; i++) {
                    this.occupant.weights[i] = adj.includes(i) ? 0 : 1;
                }
            }
            occupied = this.occupant.updateUser(position)
        }

        if (occupied) {
            // Lose condition
            this.white = false;
            this.player.recording = false;
            this.smack.play();
        } else {
            // Special rules
            let played = false;
            this.history.push(soundId[position]);
            if (this.synthHistory.length === 2) {
                this.synthHistory.sort(this.orderFunc);
                this.synthetic2.forEach(synthesis => {
                    if (this.arrayComp(this.synthHistory, synthesis.pattern)) {
                        played = true;
                        this.player.play(synthesis.id, 1, position);
                        this.history.pop();
                    }
                });
                this.synthHistory = [];
            } else if (this.history.length >= 3) {
                const ids = [];
                const orderedIds = [];
                for (let i = 0; i < 3; i++) {
                    const id = this.history.shift();
                    ids.push(id);
                    orderedIds.push(id);
                }
                orderedIds.sort(this.orderFunc);
                
                if (orderedIds[0] === orderedIds[1] && orderedIds[1] === orderedIds[2]) {
                    const type = ids[0];
                    for (let i = 0; i < this.rulePatterns.length; i++) {
                        const rule = this.rulePatterns[i];
                        if (rule.patterns.includes(type)) {
                            this.rules[rule.key] = 3;
                        }
                    }
                    played = true;
                    this.player.play(position, 3);
                } else {
                    this.synthetic1.forEach(synthesis => {
                        if (this.arrayComp(orderedIds, synthesis.pattern)) {
                            played = true;
                            this.player.play(synthesis.id, 1, position);
                            this.synthHistory.push(synthesis.id);
                        }
                    });
                }
                if (!played) {
                    ids.shift();
                    this.history.unshift(...ids);
                }
            }
            if (!played) this.player.play(position);
        }

        return occupied;
    }

    arrayComp(a, b) {
        for (let i = 0; i < a.length; i++) {
            const ai = a[i];
            const bi = b[i];
            if (ai !== bi) return false;
        }
        return true;
    }

    getXY(position, coordinateType) {
        const coordinates = {};
        
        coordinates[coordinateType[0]] = position % this.dimension;
        coordinates[coordinateType[1]] = Math.floor(position / this.dimension);
        
        return coordinates;
    }

    getAdjacent(position) {
        const x = position % this.dimension;
        const y = Math.floor(position / this.dimension);
        
        const adj = [];
        if (x - 1 > -1) adj.push(position - 1);
        if (x + 1 < this.dimension - 1) adj.push(position + 1);
        if (y - 1 > -1) adj.push(position - this.dimension);
        if (y - 1 < this.dimension - 1) adj.push(position + this.dimension);

        return adj;
    }

    mouseListener(event) {
        if (!this.white) return;

        const x = event.clientX;
        const y = event.clientY;

        const h = document.body.clientHeight;
        const w = document.body.clientWidth;

        let pos = 0;
        if (x > w / 3) pos += 1;
        if (x > 2 * w / 3) pos += 1;
        if (y > h / 3) pos += 3;
        if (y > 2 * h / 3) pos += 3;

        this.moveAvatar(pos);
    }

    keyDownListener(event) {
        if (!this.white) return;

        let key = +event.key - 1;
        if (isNaN(key)) key = this.keyMap[event.key];
        if (key + 1 && this.lastKey !== key) {
            this.lastKey = key;
            this.moveAvatar(key);
        }
    }

    keyUpListener() {
        this.lastKey = null;
    }
    
    render() {
        return (
        <div className="Board" tabIndex="0"
             style={{backgroundColor: this.state.color}}
             onMouseDown={this.mouseListener}
             onKeyDown={this.keyDownListener}
             onKeyUp={this.keyUpListener}>
            <Avatar id="Occupant" color={DEFAULT_COLOR} isHidden={!this.white || this.rules.shielding}
                    x={this.state.ox}
                    y={this.state.oy}/>
            <Avatar id="User" color={this.white ? "white" : "black"}
                    x={this.state.ux}
                    y={this.state.uy}/>
        </div>
        );
    }
}

export default Board;
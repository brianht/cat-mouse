import React, { Component } from 'react';
import './Board.css'
import smack from '../sounds/smack.wav';
import Occupant from './Occupant';
import Player from './Player';
import Avatar from './Avatar/Avatar';
import { DEFAULT_COLOR, colors, randomizeResources } from '../resources';

class Board extends Component {
    white = true;
    coordinateType = {
        'user': ['ux', 'uy'],
        'occupant': ['ox', 'oy']
    }

    lastKey = null;
    keyMap = {
        'w': 0, 's': 1, 'a': 2,
        'd': 3, 'f': 4, 'ArrowLeft': 5,
        'ArrowUp': 6, 'ArrowDown': 7, 'ArrowRight': 8
    }

    constructor(props) {
        super(props);

        this.size = props.size;
        this.dimension = Math.ceil(Math.sqrt(this.size));
        this.center = Math.floor(this.size / 2);
        const userCoordinates = this.getXY(this.center, this.coordinateType.user);

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
        this.keyListener = this.keyListener.bind(this);
        this.mouseListener = this.mouseListener.bind(this);
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

        const occupied = this.occupant.updateUser(position);

        if (occupied) {
            this.white = false;
            this.player.recording = false;
            this.smack.play();
        } else {
            this.player.play(position);
        }

        return occupied;
    }

    getXY(position, coordinateType) {
        const coordinates = {};
        
        coordinates[coordinateType[0]] = position % this.dimension;
        coordinates[coordinateType[1]] = Math.floor(position / this.dimension);
        
        return coordinates;
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

    keyListener(event) {
        if (!this.white) return;

        let key = +event.key - 1;
        if (isNaN(key)) key = this.keyMap[event.key];
        if (key + 1) this.moveAvatar(key);
    }

    render() {
        return (
        <div className="Board" tabIndex="0"
             style={{backgroundColor: this.state.color}}
             onKeyDown={this.keyListener} onMouseDown={this.mouseListener}>
            <Avatar id="Occupant" color={DEFAULT_COLOR} isHidden={!this.white}
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
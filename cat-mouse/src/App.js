import React, { Component } from 'react';
import './App.css';
import smack from './sounds/smack.wav';

import {DEFAULT_COLOR, colors, randomizeResources} from './resources';

import Avatar from './Avatar';
import Player from './Player';
import Occupant from './Occupant';

class App extends Component {
  timer = null;
  white = true;
  lastKey = null;
  occupant = new Occupant(4, 9);
  player = new Player();
  keyMap = {
    'w': 0, 's': 1, 'a': 2,
    'd': 3, 'f': 4, 'ArrowLeft': 5,
    'ArrowUp': 6, 'ArrowDown': 7, 'ArrowRight': 8
  }

  constructor(props) {
    super(props);

    const ox = this.occupant.position % 3;
    const oy = Math.floor(this.occupant.position / 3);

    this.state = { color: DEFAULT_COLOR, x: 1, y: 1, ox: ox, oy: oy };
    this.player.recording = true;

    this.resetState = this.resetState.bind(this);
    this.moveAvatar = this.moveAvatar.bind(this);
    this.keyListener = this.keyListener.bind(this);
    this.mouseListener = this.mouseListener.bind(this);
  }

  resetState() {
    this.moveAvatar(4, false);
    this.occupant.resetState(4, 9);

    this.player.clearRecording();
    this.player.recording = true;

    randomizeResources();

    this.white = true;
  }

  moveAvatar(position, colorChange = true) {
    clearTimeout(this.timer);

    const color = colorChange ? colors[position] : DEFAULT_COLOR;
    this.setState({ 
      color: color, 
      x: position % 3, 
      y: Math.floor(position / 3) 
    });

    let delay = 500;
    if (this.white && this.updatePositions(position)) delay = 0;

    this.timer = setTimeout(() => this.setState({color: DEFAULT_COLOR}), delay);
  }

  updatePositions(position) {
    const ox = this.occupant.position % 3;
    const oy = Math.floor(this.occupant.position / 3);
    this.setState({ox: ox, oy: oy});

    const occupied = this.occupant.updateUser(position);

    if (occupied) {
      this.white = false;
      this.player.recording = false;

      const audio = new Audio(smack);
      audio.onended = () => {
        if (this.player.queue.length > 0) {
          this.player.playRecording(this.moveAvatar, this.resetState);
        } else {
          this.resetState();
        }
      }
      audio.play();
    }

    return occupied;
  }

  mouseListener(event) {
    if (!this.white) return;

    const x = event.clientX;
    const y = event.clientY;

    const e = document.getElementsByClassName('App')[0];
    const h = e.clientHeight;
    const w = e.clientWidth;

    let pos = 0;
    if (x > w / 3) pos += 1;
    if (x > 2 * w / 3) pos += 1;
    if (y > h / 3) pos += 3;
    if (y > 2 * h / 3) pos += 3;

    this.moveAvatar(pos);
    if (this.white) this.player.play(pos);
  }

  keyListener(event) {
    if (!this.white) return;

    let key = +event.key - 1;
    if (isNaN(key)) key = this.keyMap[event.key];
    if (colors[key]) {
      this.moveAvatar(key);
      if (this.white) this.player.play(key);
    }
  }
  
  render() {
    return (
      <div className="App" tabIndex="0"
           onKeyDown={this.keyListener}
           onMouseDown={this.mouseListener}
           style={{backgroundColor: this.state.color}}>
        <Avatar x={this.state.ox} y={this.state.oy} color={DEFAULT_COLOR} isHidden={!this.white}/>
        <Avatar x={this.state.x} y={this.state.y} color={this.white ? "white" : "black"}/>
      </div>
    );
  }
}

export default App;

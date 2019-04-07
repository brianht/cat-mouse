import React, { Component } from 'react';
import './App.css';
import smack from './sounds/smack.wav';

import {DEFAULT_COLOR, colors, randomizeResources} from './resources';

import Avatar from './Avatar';
import Player from './Player';
import Mouse from './Mouse';

class App extends Component {
  timer = null;
  white = true;
  mouse = new Mouse(4, 9);
  player = new Player();

  constructor(props) {
    super(props);

    const mx = this.mouse.position % 3;
    const my = Math.floor(this.mouse.position / 3);

    this.state = { color: DEFAULT_COLOR, x: 1, y: 1, mx: mx, my: my };
    this.player.recording = true;

    this.resetState = this.resetState.bind(this);
    this.moveAvatar = this.moveAvatar.bind(this);
    this.keyListener = this.keyListener.bind(this);
    this.mouseListener = this.mouseListener.bind(this);
  }

  resetState() {
    this.moveAvatar(4, false);
    this.mouse.resetState(4, 9);

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
    const mx = this.mouse.position % 3;
    const my = Math.floor(this.mouse.position / 3);
    this.setState({mx: mx, my: my});

    const caughtMouse = this.mouse.updateCat(position);
    if (caughtMouse) {
      this.white = false;
      this.player.recording = false;

      const audio = new Audio(smack);
      audio.onended = () => {
        if (this.player.queue.length > 0) {
          this.player.reverseRecording();
          this.player.playRecording(this.moveAvatar, this.resetState, 1.5);
        } else {
          this.resetState();
        }
      }
      audio.play();
    }

    return caughtMouse;
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

    const key = +event.key - 1;
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
        <Avatar x={this.state.mx} y={this.state.my} color={DEFAULT_COLOR} isHidden={!this.white}/>
        <Avatar x={this.state.x} y={this.state.y} color={this.white ? "white" : "black"}/>
      </div>
    );
  }
}

export default App;

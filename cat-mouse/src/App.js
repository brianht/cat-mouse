import React, { Component } from 'react';
import Board from './Board/Board';

class App extends Component {
    render() {
        return (
            <div className="App">
                <Board size={9}/>
            </div>
        );
    }
}

export default App;

import bell from './sounds/bell.wav';
import click from './sounds/click.wav';
import crinkel from './sounds/crinkel.wav';
import cut from './sounds/cut.wav';
import creak from './sounds/creak.wav';
import indicator from './sounds/indicator.wav';
import shatter from './sounds/shatter.wav';
import spin from './sounds/spin.wav';
import splash from './sounds/splash.wav';
import tear from './sounds/tear.wav';

export const sounds = [
    click, crinkel, cut,
    indicator, spin, splash,
    tear, creak, bell, shatter
];

export const colors = [ 
    'gold', 'turquoise', 'springgreen',
    'blueviolet', 'red', 'deepskyblue',
    'orange', 'yellowgreen', 'hotpink'
];

function randomize(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function randomizeResources() {
    randomize(sounds);
    randomize(colors);
}

export const DEFAULT_COLOR = '#282c34';
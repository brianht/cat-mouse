import bell from './sounds/bell.wav';
import click from './sounds/click.wav';
import crinkel from './sounds/crinkel.wav';
import cut from './sounds/cut.wav';
import creak from './sounds/creak.wav';
import indicator from './sounds/indicator.wav';
import spin from './sounds/spin.wav';
import splash from './sounds/splash.wav';
import tear from './sounds/tear.wav';

const RESOURCE_COUNT = 9;

export const sounds = [
    click, crinkel, cut,
    indicator, spin, splash,
    tear, creak, bell
];

export const cachedAudio = Array.from(sounds, sound => new Audio(sound));

export const colors = [ 
    'gold', 'turquoise', 'springgreen',
    'blueviolet', 'red', 'deepskyblue',
    'orange', 'yellowgreen', 'hotpink'
];

const RESOURCES = [sounds, cachedAudio, colors];

export function randomizeResources() {
    for (let i = RESOURCE_COUNT - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        for (let k = 0; k < RESOURCES.length; k++) {
            const array = RESOURCES[k];
            [array[i], array[j]] = [array[j], array[i]];   
        }
    }
}

export const DEFAULT_COLOR = '#282c34';
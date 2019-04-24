// Core
import bell from './sounds/bell.wav';
import click from './sounds/click.wav';
import crinkle from './sounds/crinkle.wav';
import cut from './sounds/cut.wav';
import creak from './sounds/creak.wav';
import indicator from './sounds/indicator.wav';
import spin from './sounds/spin.wav';
import splash from './sounds/splash.wav';
import tear from './sounds/tear.wav';

// Bonus
import laser from './sounds/laser.wav';
import register from './sounds/register.wav';
import siren from './sounds/siren.wav';
import slots from './sounds/slots.wav';
import violin from './sounds/violin.wav';
import blast from './sounds/blast.wav';

const RESOURCE_COUNT = 9;

export const soundEnum = {
    // Core
    click: 0, crinkle: 1, cut: 2,
    indicator: 3, spin: 4, splash: 5,
    tear: 6, creak: 7, bell: 8,
    // Bonus
    laser: 9, register: 10, siren: 11,
    slots: 12, violin: 13, blast: 14
}

export const soundMap = [
    // Core
    click, crinkle, cut,
    indicator, spin, splash,
    tear, creak, bell,
    // Bonus
    laser, register, siren,
    slots, violin, blast
]

export const soundId = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export function getSound(key) {
    if (key > 8 && soundMap[key]) {
        return soundMap[key];
    }
    return soundMap[soundId[key]];
}

export const audioCache = Array.from(soundMap, sound => new Audio(sound));

export function getCached(key) {
    if (key > 8 && audioCache[key]) {
        return audioCache[key];
    }
    return audioCache[soundId[key]];
}

export const colors = [ 
    'gold', 'turquoise', 'springgreen',
    'blueviolet', 'red', 'deepskyblue',
    'orange', 'yellowgreen', 'hotpink'
];

const RESOURCES = [soundId, colors];

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
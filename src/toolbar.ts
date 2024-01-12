import { EventEmitter } from "./event";

export class Toolbar extends EventEmitter<{
    zoomIn: {},
    zoomOut: {},
}> {
    constructor() {
        super();

        const container = document.getElementById('toolbar');
        const zoomInBtn = container.querySelector('#zoom-in');
        const zoomOutBtn = container.querySelector('#zoom-out');

        zoomInBtn.addEventListener('click', () => this.emitEvent('zoomIn', {}));
        zoomOutBtn.addEventListener('click', () => this.emitEvent('zoomOut', {}));
    }
}
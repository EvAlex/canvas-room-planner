import { Toolbar } from "../toolbar";
import { createElement, defineElement, prefixElement } from "../utils";
import { Drawer } from "./drawer";
import { DrawerFactory } from "./drawer-factory";

export class Designer extends HTMLElement {
  static createElement = defineElement(this);

  drawer: Drawer;

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    shadow.appendChild(
      createElement(
        "style",
        {},
        `
          :host {
            display: block;
          }

          canvas {
            cursor: crosshair;
          }
          `
      )
    );

    this.drawer = new DrawerFactory().build(
      shadow.appendChild(
        createElement("canvas", {
          width: shadow.host.parentElement.clientWidth,
          height: shadow.host.parentElement.clientHeight,
        })
      ) as HTMLCanvasElement
    );

    const toolbar = shadow.appendChild(Toolbar.createElement());

    toolbar.addEventListener("zoomIn", () => this.drawer.zoomIn());
    toolbar.addEventListener("zoomOut", () => this.drawer.zoomOut());
  }
}

import { createElement, createEvent, defineElement, prefixElement } from "./utils";

export class Toolbar extends HTMLElement {
  static createElement = defineElement(this);

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    shadow.appendChild(
      createElement(
        "style",
        {},
        `
        :host {
            position: absolute;
            bottom: 44px;
            left: 120px;
            padding: 4px 8px;
            border: 1px solid lightgray;
            border-radius: 4px;
        }
    `
      )
    );

    shadow
      .appendChild(createElement("button", {}, "+"))
      .addEventListener("click", (e) =>
        this.dispatchEvent(createEvent("zoomIn"))
      );

    shadow
      .appendChild(createElement("button", {}, "-"))
      .addEventListener("click", (e) =>
        this.dispatchEvent(createEvent("zoomOut"))
      );
  }
}

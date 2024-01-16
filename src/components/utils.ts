export function createElement<
  K extends keyof HTMLElementTagNameMap,
  T = HTMLElementTagNameMap[K]
>(
  name: K,
  attrs: Partial<Record<keyof T, string|number>> = {},
  ...children: (HTMLElement | string)[]
): HTMLElement {
  const element = document.createElement(name);

  Object.keys(attrs).forEach((key) =>
    element.setAttribute(key, attrs[key as keyof T] as string)
  );

  for (const child of children) {
    if (typeof child === "string") {
      if (children.length > 1) {
        element.innerHTML += child;
      } else {
        element.textContent = child;
      }
    } else {
      element.appendChild(child);
    }
  }

  return element;
}

export function createEvent(
  type: string,
  config: EventInit = {
    bubbles: true,
    cancelable: false,
    composed: true,
  }
): CustomEvent {
  return new CustomEvent(type, config);
}

export function prefixElement(name: string): string {
  return "crp-" + name;
}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export function defineElement<T extends HTMLElement>(ctor: Type<T>, name: string = ctor.name.toLowerCase()): () => T {
  const elementName = prefixElement(name);

  customElements.define(elementName, ctor);

  return () => createElement(elementName as any) as T;
}
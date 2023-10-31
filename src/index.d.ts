declare class ObservableElement extends HTMLElement {
  attributeChangedCallback: Function;
  connectedCallback: Function;
  observe(properties: string[], callback: Function): void;
}

export { ObservableElement };

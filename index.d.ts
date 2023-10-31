export declare interface ObservableElement extends HTMLElement {
  attributeChangedCallback: Function;
  connectedCallback: Function;
  observe(props: string[], callback: Function): void;
}

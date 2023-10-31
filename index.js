class ObservableElement extends HTMLElement {
  constructor() {
    super();
    this._callbacks = {};
  }

  observe(props, callback) {
    props.forEach((prop) => {
      this._callbacks[prop] = callback.bind(this);
      // Reflect props to attributes on start
      if (['string', 'number'].includes(typeof this[prop]))
        this.setAttribute(prop, this[prop]);
    });

    // If element not connected, call callback when it does
    if (!this.connectedCallback) {
      this.connectedCallback = () => {
        this._callbacks.forEach((c) => c());
      };
    }

    // Reflect attributes in props
    if (!this.attributeChangedCallback) {
      this.attributeChangedCallback = (name, _, newValue) => {
        this['_' + name] = newValue;
        this._callbacks[name]();
      };
    }

    // Update all attributes on initialize
    props.forEach((prop) => {
      if (this.getAttribute(prop) !== null) {
        this.attributeChangedCallback(prop, null, this.getAttribute(prop));
      } else {
        this.attributeChangedCallback(prop, null, this[prop]);
      }
    });

    // Add getters & setters for props
    props.forEach((prop) => {
      Object.defineProperty(this, prop, {
        get() {
          return this['_' + prop];
        },
        set(value) {
          this['_' + prop] = value;
          this.setAttribute(prop, value);
          this._callbacks[prop]();
        },
      });
    });

    // When any attributes change, call the attribute changed callback
    const observer = new MutationObserver((x) => {
      const name = x[0].attributeName;
      this.attributeChangedCallback(name, null, this.getAttribute(name));
    });
    observer.observe(this, { attributes: true });

    // If the element has already connected, call the callback
    if (this.isConnected) callback.bind(this)();
  }
}

export { ObservableElement };

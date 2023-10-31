class ObservableElement extends HTMLElement {
  observe(properties, callback) {
    const props = properties;
    this._callbacks = {};
    this._connected = false;
    this._freezeProps = false;

    /* Functions for setting/getting props and attributes */

    const setProp = (prop, value, shouldNotReflect) => {
      if (this._freezeProps) {
        this._freezeProps = false;
        return;
      }
      this['_' + prop] = value;
      if (!shouldNotReflect) reflectPropToAttributes(prop, value);
      if (this._connected) this._callbacks[prop]();
    };

    const getProp = (prop) => {
      return this['_' + prop];
    };

    const reflectPropToAttributes = (prop, value) => {
      console.log(typeof getProp(prop));
      if (['string', 'number'].includes(typeof getProp(prop))) {
        this.setAttribute(prop, value);
      } else {
        this._freezeProps = true;
        this.removeAttribute(prop);
      }
    };

    // On startup
    props.forEach((prop) => {
      // Add callbacks to callbacks hash
      this._callbacks[prop] = callback.bind(this);

      // Update all props/attributes on initialize
      // Prefer props, then attributes
      if (this[prop]) {
        setProp(prop, this[prop]);
      } else if (this.getAttribute(prop) !== null) {
        setProp(prop, this.getAttribute(prop));
      }
    });

    // Whenever props are accessed or set
    props.forEach((prop) => {
      Object.defineProperty(this, prop, {
        get() {
          return getProp(prop);
        },
        set(value) {
          setProp(prop, value);
        },
      });
    });

    /* Component lifecycle */

    const observer = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          // When any attributes change, call the attributeChangedCallback
          // and set the props
          const name = mutation.attributeName;
          if (this.attributeChangedCallback) {
            this.attributeChangedCallback(
              name,
              this['_' + name],
              this.getAttribute(name)
            );
          }
          setProp(name, this.getAttribute(name), true);
        } else if (
          mutation.type === 'childList' &&
          mutation.addedNodes.length > 0
        ) {
          // When element connects, call the prop render functions
          this._connected = true;
          props.forEach((prop) => {
            if (this[prop] !== undefined) this._callbacks[prop]();
          });
        }
      });
    });
    observer.observe(this, { attributes: true, childList: true });
  }
}

export { ObservableElement };

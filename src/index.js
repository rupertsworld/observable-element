class ObservableElement extends HTMLElement {
  observe(properties, callback) {
    const props = properties;
    this._callbacks = {};
    this._connected = false;

    /* Functions for setting/getting props and attributes */

    const canBeReflected = (value) => {
      return ['string', 'number'].includes(typeof value);
    };

    const setProp = (name, value) => {
      if (this.propertyChangedCallback) {
        this.propertyChangedCallback(name, getProp(name), value);
      }
      this['_observable_' + name] = value;
      reflectPropToAttributes(name, value);
      if (this._connected) this._callbacks[name]();
    };

    const getProp = (prop) => {
      return this['_observable_' + prop];
    };

    const reflectPropToAttributes = (prop, value) => {
      if (canBeReflected(value)) {
        this.setAttribute(prop, value);
      } else {
        this.removeAttribute(prop);
      }
    };

    // On startup
    props.forEach((prop) => {
      // Add callbacks to callbacks hash
      this._callbacks[prop] = callback.bind(this);

      // Update all props/attributes on initialize
      // Prefer props, then attributes
      if (this[prop] !== undefined) {
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
          // and set the props. We need this because there's no static
          // observedAttributes array.
          const name = mutation.attributeName;
          const attribute = this.getAttribute(name);
          const prop = getProp(name);

          // Abort if there is no need for attribute change
          // if both prop and attribute are undefined, or if
          // they're already synced
          if (
            attribute === prop ||
            (typeof prop === 'number' && attribute === prop.toString()) ||
            (!canBeReflected(prop) && attribute === null)
          ) {
            return;
          }

          if (this.attributeChangedCallback) {
            this.attributeChangedCallback(name, prop, attribute);
          } else {
            setProp(name, attribute, true);
          }
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

    callback.bind(this)();
    observer.observe(this, { attributes: true, childList: true });
  }
}

export { ObservableElement };

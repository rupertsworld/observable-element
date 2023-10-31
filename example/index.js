import { ObservableElement } from 'observable-element';
console.log(ObservableElement);

class App extends ObservableElement {
  constructor() {
    super();
    this.count = 0;
    this.log = '';
    this.observe(['count'], this.render);
    // this.observe(['count'], this.updateCount);
    // this.observe(['log'], () => console.log(this.log));
  }

  render() {
    console.log('hi');
    this.innerHTML = `<div>${this.count}</div>`;
  }

  // connectedCallback() {
  //   this.innerHTML = `
  //     <div id="value">${this.count}</div>
  //     <button id="increment">+</button><button id="decrement">-</button>
  //   `;

  //   document
  //     .getElementById('increment') // Corrected 'getElementById'
  //     .addEventListener('mousedown', () => this.count++);
  //   document
  //     .getElementById('decrement') // Corrected 'getElementById'
  //     .addEventListener('mousedown', () => this.count--);
  // }

  // updateCount() {
  //   if (document.querySelector('#value')) {
  //     document.querySelector('#value').textContent = this.count;
  //   }
  // }
}

customElements.define('test-app', App); // Changed 'create' to 'define'

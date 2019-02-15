// import Core from "../Core";
//
// const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
//
// export class CoreHook {
//   constructor(events) {
//     this.events = events;
//     this._disposeFns = Object.create(null);
//   }
//
//   subscribe() {
//     if (!Array.isArray(this.events)) {
//       throw new Error("CoreHook must be provided with an array of events.");
//     }
//
//     this.events.forEach(event => {
//       this._disposeFns[event] = Core.events.on(event, this._methodFor(event));
//     });
//
//     return this.onAppReady(); // Allow hook to return promise.
//   }
//
//   dispose(...events) {
//     events = events.length > 0 ? events : this.events;
//     events.forEach(event => {
//       this._disposeFns[event]();
//     });
//     this.onDispose(events);
//   }
//
//   _methodFor(event) {
//     const nameOfMethod = capitalize(event);
//     return this[`on${nameOfMethod}`].bind(this);
//   }
//
//   // TEMPLATE methods.
//   onAppReady() {}
//
//   onDispose(events) {}
// }

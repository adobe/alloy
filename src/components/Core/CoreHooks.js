/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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

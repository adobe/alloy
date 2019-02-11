import makeEmitter from "./makeEmitter";

export default function EventBus() {
    this.publish = makeEmitter(this);
}

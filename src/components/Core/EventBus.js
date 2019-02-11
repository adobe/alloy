import makeEmitter from "../../helpers/makeEmitter";

export default function EventBus() {
    this.publish = makeEmitter(this);
}

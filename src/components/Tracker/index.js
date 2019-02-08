
export default class Tracker {
    constructor() {

    }

    get namespace() {
        return "Tracker";
    }

    componentsDidMount(core) {
        this._core = core;
    }

    send(endpoint, payload) {
        return fetch(this._core.configs.collectionUrl + "/" + endpoint, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            referrer: "client",
            body: payload
        });
    }
}
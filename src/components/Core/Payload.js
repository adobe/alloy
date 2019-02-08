
// data should be an array to support sending multiple events.
export default function Payload({ data, query = {}, metadata = {}, context = {} } = {}) {
    const payload = { data: [], query, metadata, context };
    
    // TODO Validate...
    if (data) {
        payload.data.push(data);
    }

    const append = key => (obj = {}) => {
        // TODO Validate...
        console.warn(`[Payload:appendTo${key}] To Implement!`);
        Object.assign(payload[key], obj);
        return payload;
    }

    this.appendToData = obj => payload.data.push(obj);

    this.appendToQuery = append("query");
    this.appendToMetadata = append("metadata");
    this.appendToContext = append("context");

    this.toJson = () => {
        return JSON.stringify(payload);
    };
}

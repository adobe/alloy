import { t, Selector, RequestLogger } from 'testcafe';

export default class Page {
    constructor () {
        this.edgeGateway           = RequestLogger(/edgegateway\.azurewebsites/, {
                                        logRequestHeaders:     true,
                                        logRequestBody:        true,
                                        stringifyRequestBody:  true,
                                        logResponseBody:       true,
                                        stringifyResponseBody: true,
                                        logResponseHeaders:    true
                                    });
        this.alloyQe              = RequestLogger(/alloyqe\.azurewebsites/, {
                                        logRequestHeaders:     true,
                                        logRequestBody:        true,
                                        stringifyRequestBody:  true,
                                        logResponseBody:       true,
                                        stringifyResponseBody: true,
                                        logResponseHeaders:    true
                                    });
                                    
    }
    async loggerContains(logger,substring) {
        return t.expect(logger.contains(record => record.request.url.match(substring))).ok();
    }
    async loggerNotContains(logger,substring) {
        return t.expect(logger.contains(record => record.request.url.match(substring))).notOk();
    }
}
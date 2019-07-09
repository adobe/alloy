import { ClientFunction } from 'testcafe';
import Page from '../helpers/page-model';

const page = new Page();

const urlCollector = 'https://alloyqe.azurewebsites.net/';

fixture `test`
    .page(urlCollector)
    .requestHooks(page.edgeGateway,page.alloyQe);

test('C2560 - ', async t => {

    await t.expect(page.alloyQe.contains(record =>
        record.request.url.match('https://alloyqe.azurewebsites.net/'))).ok();

    await t.expect(page.edgeGateway.contains(record =>
        record.request.url.match('https://edgegateway.azurewebsites.net/'))).ok();
    
    console.log(page.alloyQe.requests)

    });
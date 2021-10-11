
# Saving Bytes

I'm trying to reduce the minified js library by doing some minification tricks.  I am not intending to change any functionality at all.  Only trying to reduce the size of the final minified `dist/alloy.min.js` file. 

## Log

| size in bytes | changes to get there                                                                                                                                                                |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 71,512        | Started at 71,512                                                                                                                                                                   |
| 68,468        | Rewrote `/src/components/Personalization/dom-actions/scripts.js` to not include `@adobe/reactor-load-script`.  This removes the `@adobe/reactor-promise` dependency which is bulky. |
| 67,659        | Rewrote `/src/utils/querystring.js` to not include `@adobe/reactor-query-string` dependency which is bulky. (added to `/test/unit/specs/utils/querystring.spec.js` tests)           |
| 67,512        | Removed `output.intro` from `rollup.config.js` since it should be in documentation anyway                                                                                           |
| 67,127        | Rewrote `/src/utils/assign.js` to not include `@adobe/reactor-object-assign` dependency which is slightly outdated and bulky                                                        |
| 67,034        | created `/src/utils/window.js`, replaced all `window` references                                                                                                                    |
| 66,949        | created `/src/utils/document.js`, replaced all `document` references                                                                                                                |
| 66,715        | created `/src/utils/Object.keys.js`, replaced all `Object.keys` references                                                                                                          |
| 66,643        | created `/src/utils/JSON.stringify.js`, replaced all `JSON.stringify` references                                                                                                    |

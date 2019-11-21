/**
 MIT License

 Copyright (c) 2018 Copyright 2018 Klaus Hartl, Fagner Brack, GitHub Contributors

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

// All cookies we write will be coming from server response bodies and their
// names and values will have already been properly encoded for cookie storage.
// It's important that we do not attempt to re-encode this data. By default,
// the @adobe/reactor-cookie utility provided by Launch encodes names and values.
// @adobe/reactor-cookie exposes `get`, `set`, and `remove` methods from the
// underlying js-cookie utility (Launch didn't export more of js-cookie in order
// to reduce the amount of API Launch needed to maintain). In order to modify
// encoding behavior, however, @adobe/reactor-cookie would need to export the
// `withConverter` method of js-cookie. However, even then, `withConverter` will
// only allow us to modify encoding behavior of cookie values and not cookie
// names. This was submitted as an issue to js-cookie here:
// https://github.com/js-cookie/js-cookie/issues/560
// Until this gets resolved, we need to roll our own or use some other library
// that allows us to avoid encoding and decoding.

function extend () {
  var result = {}
  for (var i = 0; i < arguments.length; i++) {
    var attributes = arguments[i]
    for (var key in attributes) {
      result[key] = attributes[key]
    }
  }
  return result
}

function set (key, value, attributes) {
  if (typeof document === 'undefined') {
    return
  }

  attributes = extend(api.defaults, attributes)

  if (typeof attributes.expires === 'number') {
    attributes.expires = new Date(Date.now() + attributes.expires * 864e5)
  }
  if (attributes.expires) {
    attributes.expires = attributes.expires.toUTCString()
  }

  var stringifiedAttributes = ''
  for (var attributeName in attributes) {
    if (!attributes[attributeName]) {
      continue
    }

    stringifiedAttributes += '; ' + attributeName

    if (attributes[attributeName] === true) {
      continue
    }

    // Considers RFC 6265 section 5.2:
    // ...
    // 3.  If the remaining unparsed-attributes contains a %x3B (";")
    //     character:
    // Consume the characters of the unparsed-attributes up to,
    // not including, the first %x3B (";") character.
    // ...
    stringifiedAttributes += '=' + attributes[attributeName].split(';')[0]
  }

  return (document.cookie = key + '=' + value + stringifiedAttributes)
}

function get (key) {
  if (typeof document === 'undefined' || (arguments.length && !key)) {
    return
  }

  // To prevent the for loop in the first place assign an empty array
  // in case there are no cookies at all.
  var cookies = document.cookie ? document.cookie.split('; ') : []
  var jar = {}
  for (var i = 0; i < cookies.length; i++) {
    var parts = cookies[i].split('=')
    var cookie = parts.slice(1).join('=')

    if (cookie.charAt(0) === '"') {
      cookie = cookie.slice(1, -1)
    }

    try {
      var name = parts[0]
      jar[name] = cookie

      if (key === name) {
        break
      }
    } catch (e) {}
  }

  return key ? jar[key] : jar
}

var api = {
  defaults: {
    path: '/'
  },
  set: set,
  get: get,
  remove: function (key, attributes) {
    set(
      key,
      '',
      extend(attributes, {
        expires: -1
      })
    )
  }
}

export default api;

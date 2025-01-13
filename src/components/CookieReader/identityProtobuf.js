/* eslint-disable no-bitwise, max-classes-per-file, no-multi-assign, func-style, no-plusplus, vars-on-top */
/* eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars */
/*
 * Generated automatically by the command
 * `npx --package "protobufjs-cli" --command "pbjs --target static-module --wrap es6 --es6 --no-create --no-encode --no-verify --no-convert --no-delimited --no-beautify --no-service ./kndctr.proto"
 */
import * as $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader;
const $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots.default || ($protobuf.roots.default = {});

export const Identity = ($root.Identity = (() => {
  /**
   * Properties of an Identity.
   * @exports IIdentity
   * @interface IIdentity
   * @property {string|null} [ecid] Identity ecid
   * @property {IIdentityMetadata|null} [metadata] Identity metadata
   * @property {number|Long|null} [lastSync] Identity lastSync
   * @property {number|Long|null} [syncHash] Identity syncHash
   * @property {number|null} [idSyncContainerId] Identity idSyncContainerId
   * @property {number|Long|null} [writeTime] Identity writeTime
   */

  /**
   * Constructs a new Identity.
   * @exports Identity
   * @classdesc Represents an Identity.
   * @implements IIdentity
   * @constructor
   * @param {IIdentity=} [p] Properties to set
   */
  function Identity(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * Identity ecid.
   * @member {string} ecid
   * @memberof Identity
   * @instance
   */
  Identity.prototype.ecid = "";

  /**
   * Identity metadata.
   * @member {IIdentityMetadata|null|undefined} metadata
   * @memberof Identity
   * @instance
   */
  Identity.prototype.metadata = null;

  /**
   * Identity lastSync.
   * @member {number|Long} lastSync
   * @memberof Identity
   * @instance
   */
  Identity.prototype.lastSync = $util.Long
    ? $util.Long.fromBits(0, 0, false)
    : 0;

  /**
   * Identity syncHash.
   * @member {number|Long} syncHash
   * @memberof Identity
   * @instance
   */
  Identity.prototype.syncHash = $util.Long
    ? $util.Long.fromBits(0, 0, false)
    : 0;

  /**
   * Identity idSyncContainerId.
   * @member {number} idSyncContainerId
   * @memberof Identity
   * @instance
   */
  Identity.prototype.idSyncContainerId = 0;

  /**
   * Identity writeTime.
   * @member {number|Long} writeTime
   * @memberof Identity
   * @instance
   */
  Identity.prototype.writeTime = $util.Long
    ? $util.Long.fromBits(0, 0, false)
    : 0;

  /**
   * Decodes an Identity message from the specified reader or buffer.
   * @function decode
   * @memberof Identity
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {Identity} Identity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  Identity.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l;
    var m = new $root.Identity();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.ecid = r.string();
          break;
        }
        case 10: {
          m.metadata = $root.IdentityMetadata.decode(r, r.uint32());
          break;
        }
        case 20: {
          m.lastSync = r.int64();
          break;
        }
        case 21: {
          m.syncHash = r.int64();
          break;
        }
        case 22: {
          m.idSyncContainerId = r.int32();
          break;
        }
        case 30: {
          m.writeTime = r.int64();
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Gets the default type url for Identity
   * @function getTypeUrl
   * @memberof Identity
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  Identity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = "type.googleapis.com";
    }
    return `${typeUrlPrefix}/Identity`;
  };

  return Identity;
})());

export const IdentityMetadata = ($root.IdentityMetadata = (() => {
  /**
   * Properties of an IdentityMetadata.
   * @exports IIdentityMetadata
   * @interface IIdentityMetadata
   * @property {number|Long|null} [createdAt] IdentityMetadata createdAt
   * @property {boolean|null} [isNew] IdentityMetadata isNew
   * @property {number|null} [deviceType] IdentityMetadata deviceType
   * @property {string|null} [region] IdentityMetadata region
   * @property {number|null} [source] IdentityMetadata source
   */

  /**
   * Constructs a new IdentityMetadata.
   * @exports IdentityMetadata
   * @classdesc Represents an IdentityMetadata.
   * @implements IIdentityMetadata
   * @constructor
   * @param {IIdentityMetadata=} [p] Properties to set
   */
  function IdentityMetadata(p) {
    if (p)
      for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
        if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
  }

  /**
   * IdentityMetadata createdAt.
   * @member {number|Long} createdAt
   * @memberof IdentityMetadata
   * @instance
   */
  IdentityMetadata.prototype.createdAt = $util.Long
    ? $util.Long.fromBits(0, 0, false)
    : 0;

  /**
   * IdentityMetadata isNew.
   * @member {boolean} isNew
   * @memberof IdentityMetadata
   * @instance
   */
  IdentityMetadata.prototype.isNew = false;

  /**
   * IdentityMetadata deviceType.
   * @member {number} deviceType
   * @memberof IdentityMetadata
   * @instance
   */
  IdentityMetadata.prototype.deviceType = 0;

  /**
   * IdentityMetadata region.
   * @member {string} region
   * @memberof IdentityMetadata
   * @instance
   */
  IdentityMetadata.prototype.region = "";

  /**
   * IdentityMetadata source.
   * @member {number} source
   * @memberof IdentityMetadata
   * @instance
   */
  IdentityMetadata.prototype.source = 0;

  /**
   * Decodes an IdentityMetadata message from the specified reader or buffer.
   * @function decode
   * @memberof IdentityMetadata
   * @static
   * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
   * @param {number} [l] Message length if known beforehand
   * @returns {IdentityMetadata} IdentityMetadata
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  IdentityMetadata.decode = function decode(r, l) {
    if (!(r instanceof $Reader)) r = $Reader.create(r);
    var c = l === undefined ? r.len : r.pos + l;
    var m = new $root.IdentityMetadata();
    while (r.pos < c) {
      var t = r.uint32();
      switch (t >>> 3) {
        case 1: {
          m.createdAt = r.int64();
          break;
        }
        case 2: {
          m.isNew = r.bool();
          break;
        }
        case 3: {
          m.deviceType = r.int32();
          break;
        }
        case 5: {
          m.region = r.string();
          break;
        }
        case 6: {
          m.source = r.int32();
          break;
        }
        default:
          r.skipType(t & 7);
          break;
      }
    }
    return m;
  };

  /**
   * Gets the default type url for IdentityMetadata
   * @function getTypeUrl
   * @memberof IdentityMetadata
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  IdentityMetadata.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
    if (typeUrlPrefix === undefined) {
      typeUrlPrefix = "type.googleapis.com";
    }
    return `${typeUrlPrefix}/IdentityMetadata`;
  };

  return IdentityMetadata;
})());

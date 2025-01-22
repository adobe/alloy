/* eslint-disable no-bitwise */

/** Decoding bytes is not something commonly done in vanilla JavaScript work, and as such
 * this file will strive to explain each step of decoding a protobuf in detail.
 * It leans heavily on the protobuf documentation https://protobuf.dev/programming-guides/encoding/,
 * often quoting directly from it without citation.
 */

/**
 * The kndctr cookie protobuf format
 * From https://git.corp.adobe.com/pages/experience-edge/konductor/#/api/identifying-visitors?id=device-identifiers
 * and https://git.corp.adobe.com/experience-edge/konductor/blob/master/feature-identity/src/main/kotlin/com/adobe/edge/features/identity/data/StoredIdentity.kt#L16

 * syntax = "proto3";
 * 
 * // Device-level identity for Experience Edge
 * message Identity {
 *   // The Experience Cloud ID value
 *   string ecid = 1;
 * 
 *   IdentityMetadata metadata = 10;
 * 
 *   // Used only in the 3rd party domain context.
 *   // It stores the UNIX timestamp and some metadata about the last identity sync triggered by Experience Edge.
 *   int64 last_sync = 20;
 *   int64 sync_hash = 21;
 *   int32 id_sync_container_id = 22;
 * 
 *   // UNIX timestamp when the Identity was last returned in a `state:store` instruction.
 *   // The Identity is written at most once every 24h with a large TTL, to ensure it does not expire.
 *   int64 write_time = 30;
 * }
 * 
 * message IdentityMetadata {
 *   // UNIX timestamp when this identity was minted.
 *   int64 created_at = 1;
 * 
 *   // Whether or not the identity is random (new) or based on an existing seed.
 *   bool is_new = 2;
 * 
 *   // Type of device for which the identity was generated.
 *   // 0 = UNKNOWN, 1 = BROWSER, 2 = MOBILE
 *   int32 device_type = 3;
 * 
 *   // The Experience Edge region in which the identity was minted.
 *   string region = 5;
 * 
 *   // More details on the source of the ECID identity.
 *   // Invariant: when `is_new` = true, the source must be set to `RANDOM`.
 *   // 0 = RANDOM, 1 = THIRD_PARTY_ID, 2 = FIRST_PARTY_ID, 3 = RECEIVED_IN_REQUEST
 *   int32 source = 6;
 * }
 */

const ECID_FIELD_NUMBER = 1;

/**
 * Decodes a varint from a buffer starting at the given offset.
 *
 * Variable-width integers, or varints, are at the core of the wire format. They
 * allow encoding unsigned 64-bit integers using anywhere between one and ten
 * bytes, with small values using fewer bytes.
 *
 * Each byte in the varint has a continuation bit that indicates if the byte
 * that follows it is part of the varint. This is the most significant bit (MSB)
 * of the byte (sometimes also called the sign bit). The lower 7 bits are a
 * payload; the resulting integer is built by appending together the 7-bit
 * payloads of its constituent bytes.
 *
 * 10010110 00000001        // Original inputs.
 *  0010110  0000001        // Drop continuation bits.
 *  0000001  0010110        // Convert to big-endian.
 *    00000010010110        // Concatenate.
 *  128 + 16 + 4 + 2 = 150  // Interpret as an unsigned 64-bit integer.
 *
 * @example decodeVarint(new Uint8Array([0b0, 0b1]), 0) // { value: 1, length: 2 }
 * @example decodeVarint(new Uint8Array([0b10010110, 0b00000001], 0) // { value: 150, length: 2 })
 * @param {Uint8Array} buffer
 * @param {number} offset
 * @returns {{ value: number, length: number }} The value of the varint and the
 * number of bytes it takes up.
 */
export const decodeVarint = (buffer, offset) => {
  let value = 0;
  let length = 0;
  let byte;
  do {
    byte = buffer[offset + length];
    // Drop the continuation bit (the most significant bit), convert it from
    // little endian to big endian, and add it to the accumlator `value`.
    value |= (byte & 0b01111111) << (7 * length);
    // Increase the length of the varint by one byte.
    length += 1;
  } while (byte & 0b10000000);
  return { value, length };
};

/**
 * | ID | Name   | Used for                                                 |
 * |----|--------|----------------------------------------------------------|
 * | 0  | varint | int32, int64, uint32, uint64, sint32, sint64, bool, enum |
 * | 1  | I64    | fixed64, sfixed64, double                                |
 * | 2  | LEN    | string, bytes                                            |
 * | 3  | SGROUP | group start (deprecated)                                 |
 * | 4  | EGROUP | group end (deprecated)                                   |
 * | 5  | I32    | fixed32, sfixed32, float                                 |
 */
const WIRE_TYPES = Object.freeze({
  VARINT: 0,
  I64: 1,
  LEN: 2,
  SGROUP: 3,
  EGROUP: 4,
  I32: 5,
});

/**
 * Given a protobuf as a Uint8Array and based on the protobuf definition for the
 * kndctr cookie provided at https://git.corp.adobe.com/pages/experience-edge/konductor/#/api/identifying-visitors?id=device-identifiers,
 * this function should return the ECID as a string.
 * The decoding of the protobuf is hand-crafted in order to save on size
 * compared to the full protobuf.js library.
 * @param {Uint8Array} buffer
 * @returns {string|null}
 */
const decodeKndctrProtobuf = (buffer) => {
  let offset = 0;
  let ecid = null;
  while (offset < buffer.length && !ecid) {
    // A protobuf message is a series of records. Each record is a tag, the length,
    // and the value.
    // A record always starts with the tag. The “tag” of a record is encoded as
    // a varint formed from the field number and the wire type via the formula
    // `(field_number << 3) | wire_type`. In other words, after decoding the
    // varint representing a field, the low 3 bits tell us the wire type, and the rest of the integer tells us the field number.
    // So the first step is to decode the varint
    const { value: tag, length: tagLength } = decodeVarint(buffer, offset);
    offset += tagLength;
    // Next, we get the wire type and the field number.
    // You take the last three bits to get the wire type and then right-shift by
    // three to get the field number.
    const wireType = tag & 0b111;
    const fieldNumber = tag >> 3;
    // We only care about the ECID field, so we will skip any other fields until
    // we find it.
    if (fieldNumber === ECID_FIELD_NUMBER) {
      // The wire type for the ECID field is 2, which means it is a length-delimited field.
      if (wireType === WIRE_TYPES.LEN) {
        // The next varint will tell us the length of the ECID.
        const fieldValueLength = decodeVarint(buffer, offset);
        offset += fieldValueLength.length;
        // The ECID is a UTF-8 encoded string, so we will decode it as such.
        ecid = new TextDecoder().decode(
          buffer.slice(offset, offset + fieldValueLength.value),
        );
        offset += fieldValueLength.value;
      }
    } else {
      // If we don't care about the field, we skip it.
      // The wire type tells us how to skip the field.
      switch (wireType) {
        case WIRE_TYPES.VARINT:
          // Skip the varint
          offset += decodeVarint(buffer, offset).length;
          break;
        case WIRE_TYPES.I64:
          // Skip the 64-bit integer
          offset += 8;
          break;
        case WIRE_TYPES.LEN: {
          // Find the value that represents the length of the vield
          const fieldValueLength = decodeVarint(buffer, offset);
          offset += fieldValueLength.length + fieldValueLength.value;
          break;
        }
        case WIRE_TYPES.SGROUP:
          // Skip the start group
          break;
        case WIRE_TYPES.EGROUP:
          // Skip the end group
          break;
        case WIRE_TYPES.I32:
          // Skip the 32-bit integer
          offset += 4;
          break;
        default:
          throw new Error(
            `Malformed kndctr cookie. Unknown wire type: ${wireType}`,
          );
      }
    }
  }

  return ecid;
};
export default decodeKndctrProtobuf;

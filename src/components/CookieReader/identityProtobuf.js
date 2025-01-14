/* eslint-disable no-bitwise */

/** Decoding bytes is not something commonly done in vanilla JavaScript work, and as such
 * this file will strive to explain each step of decoding a protobuf in detail.
 * It leans heavily on the protobuf documentation https://protobuf.dev/programming-guides/encoding/,
 * often quoting directly from it without citation.
 */

/** From https://git.corp.adobe.com/pages/experience-edge/konductor/#/api/identifying-visitors?id=device-identifiers */
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
 * @example decodeVarint(new Uint8Array([0b0, 0b1]), 0) // { value: 1, length: 2 }
 * @example decodeVarint(new Uint8Array([0b10010110, 0b00000001], 0) // { value: 150, length: 2 })
 * @param {Uint8Array} buffer
 * @param {number} offset
 * @returns {{ value: number, length: number }}
 */
export const decodeVarint = (buffer, offset) => {
  let value = 0;
  let length = 0;
  let byte;
  do {
    byte = buffer[offset + length];
    value |= (byte & 0b01111111) << (7 * length);
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
const decodeIdentityFromKndctrProtobuf = (buffer) => {
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
        const { value: length, length: lengthLength } = decodeVarint(
          buffer,
          offset,
        );
        offset += lengthLength;
        // The ECID is a UTF-8 encoded string, so we will decode it as such.
        ecid = new TextDecoder().decode(buffer.slice(offset, offset + length));
        offset += length;
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
          // Skip the length-delimited field
          const { value: length, length: lengthLength } = decodeVarint(
            buffer,
            offset,
          );
          offset += lengthLength + length;
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
          throw new Error(`Unknown wire type: ${wireType}`);
      }
    }
  }

  return ecid;
};
export default decodeIdentityFromKndctrProtobuf;

/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable no-bitwise */

/**
 * MurmurHash3 128-bit (x64) — matches Guava
 * `com.google.common.hash.Hashing.murmur3_128(seed).hashString(str, UTF_8).toString()`.
 *
 * Implementation follows Guava’s `Murmur3_128HashFunction` (same as smhasher
 * `MurmurHash3_x64_128` with Guava’s seeding and byte order for `HashCode.toString()`).
 *
 * @see https://github.com/google/guava/blob/master/guava/src/com/google/common/hash/Murmur3_128HashFunction.java
 *
 * Returns **32** lowercase hex characters (128 bits).
 */

const U64 = 0xffffffffffffffffn;

const rotl64 = (x, r) => ((x << BigInt(r)) | (x >> BigInt(64 - r))) & U64;

const u8 = (b) => BigInt(b & 0xff);

const readInt64LE = (bytes, offset) => {
  let v = 0n;
  for (let i = 0; i < 8; i += 1) {
    v |= u8(bytes[offset + i]) << (8n * BigInt(i));
  }
  return v & U64;
};

const C1 = 0x87c37b91114253d5n;
const C2 = 0x4cf5ad432745937fn;

const mixK1 = (k1) => {
  let k = k1 & U64;
  k = (k * C1) & U64;
  k = rotl64(k, 31);
  k = (k * C2) & U64;
  return k;
};

const mixK2 = (k2) => {
  let k = k2 & U64;
  k = (k * C2) & U64;
  k = rotl64(k, 33);
  k = (k * C1) & U64;
  return k;
};

const fmix64 = (k) => {
  let x = k & U64;
  x ^= x >> 33n;
  x = (x * 0xff51afd7ed558ccdn) & U64;
  x ^= x >> 33n;
  x = (x * 0xc4ceb9fe1a85ec53n) & U64;
  x ^= x >> 33n;
  return x & U64;
};

/** Java `int` seed sign-extended to 64-bit (Guava `Murmur3_128Hasher` initial state). */
const intSeedToLong64 = (seed) =>
  BigInt.asIntN(64, BigInt.asIntN(32, BigInt(Math.trunc(Number(seed)))));

/**
 * 128-bit MurmurHash3 (Guava-compatible), lowercase hex, no `0x` prefix.
 * @param {string} str - hashed as UTF-8 bytes
 * @param {number} [seed=0] - 32-bit seed (Guava `murmur3_128(int seed)`)
 * @returns {string} 32 hex characters
 */
export const murmurHash128GuavaHex = (str, seed = 0) => {
  // Match Java long bit pattern for (long) int seed (e.g. -1 → 0xff…ff)
  const hSeed = intSeedToLong64(seed) & U64;
  let h1 = hSeed;
  let h2 = hSeed;
  let length = 0;

  const bytes = new TextEncoder().encode(str);

  const bmix64 = (k1, k2) => {
    h1 ^= mixK1(k1);
    h1 = rotl64(h1, 27);
    h1 = (h1 + h2) & U64;
    h1 = (h1 * 5n + 0x52dce729n) & U64;

    h2 ^= mixK2(k2);
    h2 = rotl64(h2, 31);
    h2 = (h2 + h1) & U64;
    h2 = (h2 * 5n + 0x38495ab5n) & U64;
  };

  let offset = 0;
  const nblocks = Math.floor(bytes.length / 16);
  for (let i = 0; i < nblocks; i += 1) {
    bmix64(readInt64LE(bytes, offset), readInt64LE(bytes, offset + 8));
    offset += 16;
    length += 16;
  }

  const rem = bytes.length - offset;
  length += rem;
  let k1 = 0n;
  let k2 = 0n;
  const t = offset;

  switch (rem) {
    case 15:
      k2 ^= u8(bytes[t + 14]) << 48n;
    // falls through
    case 14:
      k2 ^= u8(bytes[t + 13]) << 40n;
    // falls through
    case 13:
      k2 ^= u8(bytes[t + 12]) << 32n;
    // falls through
    case 12:
      k2 ^= u8(bytes[t + 11]) << 24n;
    // falls through
    case 11:
      k2 ^= u8(bytes[t + 10]) << 16n;
    // falls through
    case 10:
      k2 ^= u8(bytes[t + 9]) << 8n;
    // falls through
    case 9:
      k2 ^= u8(bytes[t + 8]);
    // falls through
    case 8:
      k1 ^= readInt64LE(bytes, t);
      break;
    case 7:
      k1 ^= u8(bytes[t + 6]) << 48n;
    // falls through
    case 6:
      k1 ^= u8(bytes[t + 5]) << 40n;
    // falls through
    case 5:
      k1 ^= u8(bytes[t + 4]) << 32n;
    // falls through
    case 4:
      k1 ^= u8(bytes[t + 3]) << 24n;
    // falls through
    case 3:
      k1 ^= u8(bytes[t + 2]) << 16n;
    // falls through
    case 2:
      k1 ^= u8(bytes[t + 1]) << 8n;
    // falls through
    case 1:
      k1 ^= u8(bytes[t]);
      break;
    default:
      break;
  }

  h1 ^= mixK1(k1);
  h2 ^= mixK2(k2);

  const len64 = BigInt(length >>> 0);
  h1 ^= len64;
  h2 ^= len64;

  h1 = (h1 + h2) & U64;
  h2 = (h2 + h1) & U64;

  h1 = fmix64(h1);
  h2 = fmix64(h2);

  h1 = (h1 + h2) & U64;
  h2 = (h2 + h1) & U64;

  const out = new Uint8Array(16);
  const writeLongLE = (val, pos) => {
    let v = val & U64;
    for (let i = 0; i < 8; i += 1) {
      out[pos + i] = Number(v & 0xffn);
      v >>= 8n;
    }
  };
  writeLongLE(h1, 0);
  writeLongLE(h2, 8);

  return [...out].map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default murmurHash128GuavaHex;

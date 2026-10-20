import { randomInt } from "node:crypto";

// No 0/O/1/I/L so numbers survive being read over the phone. 12 chars from 31 symbols ≈ 59 bits: not guessable.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function newOrderNumber() {
  let s = "";
  for (let i = 0; i < 12; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `FR-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}

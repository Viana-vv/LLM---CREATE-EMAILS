const CHARS = " abcdefghijklmnopqrstuvwxyz0123456789@._-|\n*";

const charToIdx = {};
const idxToChar = {};

for (let i = 0; i < CHARS.length; i++) {
  charToIdx[CHARS[i]] = i + 1; // 0 fica reservado para padding
  idxToChar[i + 1] = CHARS[i];
}

const vocabSize = CHARS.length + 1;

function textToIndices(text) {
  const indices = [];
  for (let char of text) {
    if (charToIdx[char] !== undefined) {
      indices.push(charToIdx[char]);
    }
  }
  return indices;
}

function indicesToText(indices) {
  return indices.map(idx => idxToChar[idx] || '').join('');
}

module.exports = {
  vocabSize,
  textToIndices,
  indicesToText
};
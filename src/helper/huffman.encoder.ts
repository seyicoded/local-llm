// @ts-nocheck
class Node {
    freq: any;
    char: any;
    left: any;
    right: any;
    constructor(char, freq) {
      this.char = char;
      this.freq = freq;
      this.left = null;
      this.right = null;
    }
  }
  
  function buildFrequencyMap(input) {
    const frequencyMap = {};
    for (const char of input) {
      frequencyMap[char] = (frequencyMap[char] || 0) + 1;
    }
    return Object.entries(frequencyMap).map(([char, freq]) => new Node(char, freq));
  }
  
  function buildHuffmanTree(nodes) {
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.freq - b.freq);
      const left = nodes.shift();
      const right = nodes.shift();
      const newNode = new Node(null, left.freq + right.freq);
      newNode.left = left;
      newNode.right = right;
      nodes.push(newNode);
    }
    return nodes[0];
  }
  
  function buildCodeMap(root, currentCode = '', codeMap = {}) {
    if (root.char !== null) {
      codeMap[root.char] = currentCode;
    } else {
      buildCodeMap(root.left, currentCode + '0', codeMap);
      buildCodeMap(root.right, currentCode + '1', codeMap);
    }
    return codeMap;
  }
  
  export function huffmanCompress(input) {
    const frequencyNodes = buildFrequencyMap(input);
    const huffmanTree = buildHuffmanTree([...frequencyNodes]);
    const codeMap = buildCodeMap(huffmanTree);
  
    let compressed = '';
    for (const char of input) {
      compressed += codeMap[char];
    }
  
    return { huffmanTree, codeMap, compressed };
  }
  
  function huffmanDecompress(compressed, huffmanTree) {
    let current = huffmanTree;
    let result = '';
  
    for (const bit of compressed) {
      current = bit === '0' ? current.left : current.right;
      if (current.char !== null) {
        result += current.char;
        current = huffmanTree;
      }
    }
  
    return result;
  }
export function burrowsWheelerTransform(input) {
    const rotations = [];
  
    for (let i = 0; i < input.length; i++) {
      const rotation = input.slice(i) + input.slice(0, i);
      rotations.push(rotation);
    }
  
    rotations.sort();
  
    const transformed = rotations.map(rotation => rotation.charAt(rotation.length - 1)).join('');
    const index = rotations.indexOf(input);
  
    return { transformed, index };
  }
  
  export function runLengthEncode(input) {
    let result = '';
    let count = 1;
  
    for (let i = 0; i < input.length; i++) {
      if (input[i] === input[i + 1]) {
        count++;
      } else {
        result += input[i] + count;
        count = 1;
      }
    }
  
    return result;
  }
  
  export function runLengthDecode(encoded) {
    let result = '';
  
    for (let i = 0; i < encoded.length; i += 2) {
      const char = encoded[i];
      const count = parseInt(encoded[i + 1], 10);
      
      result += char.repeat(count);
    }
  
    return result;
  }
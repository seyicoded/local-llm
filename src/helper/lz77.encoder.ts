export class LZ77 {
    constructor(){}

    public static compress(input) {
      let dictionary = '';
      let result = [];
  
      for (let i = 0; i < input.length; ) {
        let longestMatch = '';
        let nextChar = input[i];
  
        for (let j = dictionary.length; j >= 0; j--) {
          const prefix = dictionary.substring(j);
          if (input.startsWith(prefix)) {
            longestMatch = prefix;
            break;
          }
        }
  
        const distance = dictionary.length - dictionary.lastIndexOf(longestMatch);
        const length = longestMatch.length;
  
        result.push({ distance, length, nextChar });
  
        dictionary += longestMatch + nextChar;
        i += length + 1;
      }
  
      return result;
    }
  
    public static decompress(compressedData) {
      let dictionary = '';
      let result = '';
  
      for (const token of compressedData) {
        if (token.length === 0) {
          result += token.nextChar;
          dictionary += token.nextChar;
        } else {
          const startIndex = dictionary.length - token.distance;
          const substring = dictionary.substring(startIndex, startIndex + token.length);
          result += substring + token.nextChar;
          dictionary += substring + token.nextChar;
        }
      }
  
      return result;
    }
}
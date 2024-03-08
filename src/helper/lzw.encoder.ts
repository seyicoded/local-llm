export class LZW {
    static compress(input) {
      const dictionary = {};
      let nextCode = 256; // Start with ASCII codes
  
      let result = [];
      let currentPhrase = input[0];
  
      for (let i = 1; i < input.length; i++) {
        const char = input[i];
        const newPhrase = currentPhrase + char;
  
        if (dictionary[newPhrase] !== undefined) {
          // Continue building the phrase
          currentPhrase = newPhrase;
        } else {
          // Output the code for the current phrase and add the new phrase to the dictionary
          result.push(dictionary[currentPhrase] || currentPhrase.charCodeAt(0));
          dictionary[newPhrase] = nextCode++;
          currentPhrase = char;
        }
      }
  
      // Output the code for the last phrase
      result.push(dictionary[currentPhrase] || currentPhrase.charCodeAt(0));
  
      return result;
    }
  
    static decompress(compressed) {
      const dictionary = {};
      let nextCode = 256; // Start with ASCII codes
  
      let result = String.fromCharCode(compressed[0]);
      let currentCode = compressed[0].toString();
  
      for (let i = 1; i < compressed.length; i++) {
        const code = compressed[i];
  
        let phrase;
        if (dictionary[code] !== undefined) {
          phrase = dictionary[code];
        } else {
          phrase = currentCode + currentCode.charAt(0);
        }
  
        result += phrase;
  
        // Add the current phrase + the first character of the next phrase to the dictionary
        dictionary[nextCode++] = currentCode + phrase.charAt(0);
  
        currentCode = phrase;
      }
  
      return result;
    }
  }
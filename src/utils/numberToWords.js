const ones = [
    "", "one", "two", "three", "four", "five", "six",
    "seven", "eight", "nine", "ten", "eleven", "twelve",
    "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
  ];
  
  const tens = [
    "", "", "twenty", "thirty", "forty",
    "fifty", "sixty", "seventy", "eighty", "ninety"
  ];
  
  function convertHundreds(num) {
    let str = "";
  
    if (num > 99) {
      str += ones[Math.floor(num / 100)] + " hundred ";
      num %= 100;
    }
  
    if (num > 19) {
      str += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }
  
    if (num > 0) {
      str += ones[num] + " ";
    }
  
    return str.trim();
  }
  
  export function numberToWords(num) {
    if (num === 0) return "zero";
  
    let words = "";
  
    if (num >= 1000) {
      words += convertHundreds(Math.floor(num / 1000)) + " thousand ";
      num %= 1000;
    }
  
    words += convertHundreds(num);
  
    return words.trim();
  }
/* ───────── VALIDATORS ───────── */

export const required = (message = "Field required") => (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return message;
    }
  };
  
  export const positive = (message = "Must be positive") => (value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      return message;
    }
  };
  
  export const integer = (message = "Must be a valid number") => (value) => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) {
      return message;
    }
  };
  
  export const min = (minValue, message) => (value) => {
    const n = Number(value);
    if (n < minValue) {
      return message || `Must be >= ${minValue}`;
    }
  };
  
  /* ───────── MAIN VALIDATION ENGINE ───────── */
  
  export const validate = (rules) => {
    for (const field in rules) {
      const { value, validators } = rules[field];
  
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          throw new Error(error);
        }
      }
    }
  };
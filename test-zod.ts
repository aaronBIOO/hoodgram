// test-zod.ts
import { SignupValidation } from "./src/lib/validation"; // Adjust path if your validation file is in a different location relative to project root

// This is the same invalid data you tried before:
const testData = {
  name:   "a",             // too short (min 2)
  username: "b",           // too short (min 2)
  email:  "invalid-email", // invalid format
  password: "123",         // too short (min 8)
};

const result = SignupValidation.safeParse(testData);
console.log("Schema is:", SignupValidation); // To ensure you're importing the correct schema object
console.log("SafeParse result:", result);
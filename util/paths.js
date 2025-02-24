// These two bellow ({ dirname } and { fileURLToPath }) imported to fix this error
// ! ReferenceError: __dirname is not defined
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.join(__dirname, "..");
// export default rootDir;

import fs from "fs/promises";
import path from "path";

import { rootDir } from "./paths.js";

export function removeFile(directoryPath, fileName) {
    const filePath = path.join(rootDir, "public", directoryPath, fileName);
    fs.unlink(filePath)
        .then((result) => {
            console.log("Previous product's image removed successfully.");
        })
        .catch((err) => {
            if (err.code === "ENOENT") {
                console.log(`File ${fileName} not found!`);
            } else {
                console.log(`Remove file failed: ${err}`);
            }
        });
}

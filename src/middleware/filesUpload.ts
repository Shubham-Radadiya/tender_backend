// import * as Busboy from "busboy";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import busboy from "busboy";
import { log } from "winston";
export const filesUpload = (req, res, next) => {
  // See https://cloud.google.com/functions/docs/writing/http#multipart_data

  const bb = busboy({
    headers: req.headers,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  const fields = {};
  const files = [];
  const fileWrites = [];

  const tmpdir = os.tmpdir();
  bb.on("field", (key, value) => {
    fields[key] = value;
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  bb.on("file", (fieldname, file, { filename, encoding, mimeType }) => {
    const filepath = path.join(tmpdir, filename);
    log(
      "info",
      `Handling file upload field ${fieldname}: ${filename} (${filepath})`
    );
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    fileWrites.push(
      new Promise((resolve, reject) => {
        file.on("end", () => writeStream.end());
        writeStream.on("finish", () => {
          fs.readFile(filepath, (err, buffer) => {
            const size = Buffer.byteLength(buffer);
            log("info", `${filename} is ${size} bytes`);
            if (err) {
              log("error", "error on busboy", err);
              return reject(err);
            }

            files.push({
              fieldname,
              originalname: filename,
              encoding,
              mimeType,
              buffer,
              size,
              filename,
              filepath,
            });

            resolve(true);
          });
        });
        writeStream.on("error", (err) => {
          log("error", "error on busboy", err);
          reject(err);
        });
      })
    );
  });

  bb.on("finish", () => {
    Promise.all(fileWrites)
      .then(() => {
        req.body = fields;
        req.files = files;
        next();
      })
      .catch(next);
  });

  req.pipe(bb);
};

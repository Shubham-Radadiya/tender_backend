import { Response } from "express";
import { Request } from "./../../request";
import { get as _get } from "lodash";
import { createAndUploadImage } from "../../modules/image";
export default class Controller {
  protected readonly createImage = async (req: Request, res: Response) => {
    /*
      {
        fieldname: 'file',        String - name of the field used in the form
        originalname,             String - original filename of the uploaded image
        encoding,                 String - encoding of the image (e.g. "7bit")
        mimetype,                 String - MIME type of the file (e.g. "image/jpeg")
        buffer,                   Buffer - buffer containing binary data
        size,                     Number - size of buffer in bytes
        filename,                 String - file name
        filepath                  String - file path
      }
    */
    try {
      const file = req.files[0];
      const image = await createAndUploadImage(
        file,
        req.body.title,
        req.body.description
      );
      res.status(200).send(image.toJSON());
    } catch (err) {
      console.log("########## Error in createImage", err);
      res.status(500).json({ error: _get(err, "message") });
    }
  };

  protected readonly deleteImage = async (req: Request, res:Response) => {
    try {
      
    } catch (err) {
       console.log("########## Error in deletingImage", err);
       res.status(500).json({ error: _get(err, "message") });
    }
    // var s3 = AWS.S3(awsCredentials);
    // s3.deleteObject(
    //   {
    //     Bucket: MY_BUCKET,
    //     Key: "some/subfolders/nameofthefile1.extension",
    //   },
    //   function (err, data) {}
    // );
  }
  // protected readonly saveLocal = async (req: Request, res: Response) => {
  //   /*
  //   {
  //     fieldname: 'file',        String - name of the field used in the form
  //     originalname,             String - original filename of the uploaded image
  //     encoding,                 String - encoding of the image (e.g. "7bit")
  //     mimetype,                 String - MIME type of the file (e.g. "image/jpeg")
  //     buffer,                   Buffer - buffer containing binary data
  //     size,                     Number - size of buffer in bytes
  //     filename,                 String - file name
  //     filepath                  String - file path
  //   }
  // */
  //   try {
  //     const file = req.files[0];
  //     const image = await createAndUploadImage(
  //       file,
  //       req.body.title,
  //       req.body.description
  //     );
  //     res.status(200).send(image.toJSON());

  //     // res.status(200).send({ message: "Image Uploded...." });
  //   } catch (err) {
  //     console.log("########## Error in LocalImage", err);
  //     res.status(500).json({ error: _get(err, "message") });
  //   }
  // };
}

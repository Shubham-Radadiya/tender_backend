import { Types } from "mongoose";
import { Image } from ".";
import { saveImageToDb } from "./saveImageToDb";
import AWS from "aws-sdk";

interface UploadFileProps {
  filename: string;
  mimetype: string;
  encoding: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createReadStream: any;
}

/**
 *
 * @param file UploadFileProps
 * @param title
 * @param description
 * @returns Image
 */
export const createAndUploadImage = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: UploadFileProps | any,
  title: string,
  description: string
): Promise<Image> => {

  // const s3 = new AWS.S3({
  //   accessKeyId: process.env.AWS_ACCESS_KEY,
  //   secretAccessKey: process.env.AWS_SECRET_KEY,
  // });

  const _id = new Types.ObjectId().toString();

  // const uploadedImage = await uploadImageToS3(file);
      // const uploadedImage = await s3
      //   .upload({
      //     Bucket: process.env.AWS_BUCKET_NAME,
      //     Key: `images/${_id}/${file.originalname}`,
      //     Body: file.buffer,
      //     ACL: "public-read",
      //   })
      //   .promise();

  // const S3ImageURL = uploadedImage.Location;
  const S3ImageURL =
    "https://d3qz1qhhp9wxfa.cloudfront.net/growingproduce/wp-content/uploads/2023/07/w_Manessa_Cabbage_Rijk-Zwaan_gallery.jpg";
  const image = new Image({
    _id,
    title: title,
    url: S3ImageURL,
    description,
  });
  return await saveImageToDb(image);
};

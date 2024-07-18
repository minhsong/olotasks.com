import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
@Injectable()
export class SpacesService {
  private readonly s3: AWS.S3;
  private readonly bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
      secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
      endpoint: process.env.DO_SPACES_ENDPOINT,
      s3ForcePathStyle: true, // needed for minio compatibility
      signatureVersion: 'v4',
    });
    this.bucketName = process.env.DO_SPACES_BUCKET_NAME;
  }

  async uploadFile(
    file: Express.Multer.File,
    fileKey: string,
  ): Promise<AWS.S3.ManagedUpload.SendData & any> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
      ACL: 'public-read',
    };

    try {
      const data = await this.s3.upload(params).promise();
      return { ...data, ...params };
    } catch (error) {
      throw new HttpException(
        'Error uploading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadFileFromBuffer(
    buffer: Buffer,
    fileKey: string,
    contentType: string,
  ): Promise<AWS.S3.ManagedUpload.SendData & any> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.byteLength,
      ACL: 'public-read',
    };

    try {
      const data = await this.s3.upload(params).promise();
      return { ...data, ...params };
    } catch (error) {
      throw new HttpException(
        'Error uploading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFile(fileKey: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new HttpException(
        'Error deleting file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFolder(folderKey: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Prefix: folderKey,
    };

    try {
      const data = await this.s3.listObjectsV2(params).promise();
      if (data.Contents.length === 0) {
        return;
      }

      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: data.Contents.map((content) => ({
            Key: content.Key,
          })),
        },
      };

      await this.s3.deleteObjects(deleteParams).promise();
    } catch (error) {
      throw new HttpException(
        'Error deleting folder',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFiles(): Promise<string[]> {
    const params = {
      Bucket: this.bucketName,
    };

    try {
      const data = await this.s3.listObjectsV2(params).promise();
      return data.Contents.map((content) => content.Key);
    } catch (error) {
      throw new HttpException(
        'Error getting files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findFileByFileName(fileKey: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      const data = await this.s3.getObject(params).promise();
      return data.Body.toString();
    } catch (error) {
      throw new HttpException(
        'Error finding file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

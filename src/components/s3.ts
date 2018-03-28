import { ILifecycle } from './lifecycle'
import * as AWS from 'aws-sdk'

export interface IS3Component {
  getObject(bucketName: string, path: string): AWS.S3.Body
}

export class S3Component implements ILifecycle, IS3Component {
  private s3: AWS.S3
  constructor(s3: AWS.S3) {
    this.s3 = s3
  }
  public start() {
    // noop
  }
  public stop() {
    // noop
  }

  public async getObject(bucketName: string, path: string) {
    return this.s3.getObject({
      Bucket: bucketName,
      Key: path,
    }).promise()
    .then((data) => data.Body)
  }
}

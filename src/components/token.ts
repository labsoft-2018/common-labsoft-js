import { ILifecycle } from './lifecycle';
import * as jwt from 'jsonwebtoken'
import { IS3Component } from './s3';

export interface ITokenComponent {
  encode(content: object): Promise<string>
  decode<T>(token: string): Promise<T>
}
export class TokenComponent implements ILifecycle, ITokenComponent {
  private config: any
  private s3: IS3Component
  private privateKey: any
  private publicKey: any

  constructor() {
    this.privateKey = null
    this.publicKey = null
  }

  public encode = (content: object) => new Promise<string>((resolve, reject) => {
    const tokenConfig = this.config.getConfig().token
    jwt.sign(content, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: tokenConfig.jwtDuration,
      audience: tokenConfig.audience,
      issuer: tokenConfig.issuer,
    }, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })

  public decode = async <T>(token: string) => new Promise<T>((resolve, reject) => {
    const tokenConfig = this.config.getConfig().token
    jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
      audience: tokenConfig.audience,
      issuer: tokenConfig.issuer,
    }, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data as T)
    })
  })

  public async start({ config, s3 }: any) {
    this.config = config
    this.s3 = s3
    const tokenConfig = this.config.getConfig().token
    const privateKey = await this.s3.getObject(tokenConfig.bucketName, tokenConfig.privateKeyPath)
    const publicKey = await this.s3.getObject(tokenConfig.bucketName, tokenConfig.publicKeyPath)
    this.privateKey = privateKey
    this.publicKey = publicKey
  }

  public async stop() {
    // noop
    this.privateKey = null
    this.publicKey = null
  }
}

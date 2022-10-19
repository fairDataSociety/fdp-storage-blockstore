import { FeedReader, FeedWriter } from '@ethersphere/bee-js'
import { FeedUploadOptions } from '@ethersphere/bee-js/dist/types/feed'
import { Reference } from '@ethersphere/swarm-cid'
import { BeeSon } from '@fairdatasociety/beeson'
import { JsonValue } from '@fairdatasociety/beeson/dist/types'
import { FdpStorage } from '@fairdatasociety/fdp-storage'

export class FeedDBCollection {
  private reader: FeedReader
  private writer: FeedWriter

  constructor(topic: string, username: string, private fdp: FdpStorage) {
    this.reader = fdp.connection.bee.makeFeedReader('sequence', topic, username)
    this.writer = fdp.connection.bee.makeFeedWriter('sequence', topic, username)
  }

  async put(data: BeeSon<JsonValue>, options?: FeedUploadOptions) {
    const d = data.serialize()
    const { reference } = await this.fdp.connection.bee.uploadData(this.fdp.connection.postageBatchId, d)

    return this.writer.upload(this.fdp.connection.postageBatchId, reference, options)
  }

  async get(ref: Reference) {
    return this.fdp.connection.bee.downloadData(ref, undefined)
  }
}

import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { FeedDBCollection } from './dbcollection'

export class FeedDB {
  constructor(private fdp: FdpStorage, public username: string, public dbName: string) {}

  getTopic(): FeedDBCollection {
    const topic = this.fdp.connection.bee.makeFeedTopic(`${this.dbName}`)

    return new FeedDBCollection(topic, this.username, this.fdp)
  }
}

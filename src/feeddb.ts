import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { FeedDBCollection } from './dbcollection'

export class FeedDB {
  constructor(private fdp: FdpStorage, public username: string, public dbName: string) {}

  getCollection(name: string): FeedDBCollection {
    const topic = this.fdp.connection.bee.makeFeedTopic(`${this.dbName}/${name}`)

    return new FeedDBCollection(topic, this.username, this.fdp)
  }
}

import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { BeeSon } from '@fairdatasociety/beeson'
import { codec, hasher } from '@fairdatasociety/beeson-multiformats'
import * as Block from 'multiformats/block'
import { JsonValue } from '@fairdatasociety/beeson/dist/types'
import { Reference } from '@ethersphere/swarm-cid'
import { CID } from 'multiformats/cid'
import { toSwarmRef } from '.'
import { FeedDB } from './feeddb'

export interface SaveDatabaseCallbackArgs {
  reference: Reference
  cid: CID
}

export interface LoadDatabaseCallbackArgs {
  data: BeeSon<JsonValue>
}

export class LokiFDPAdapter {
  db: FeedDB
  constructor(private fdp: FdpStorage, private username: string, private namespace: string) {
    this.db = new FeedDB(this.fdp, this.username, namespace)
  }

  async saveDatabase(
    key: string,
    value: BeeSon<JsonValue>,
    callback: (err: Error | null, args?: SaveDatabaseCallbackArgs) => void,
  ) {
    try {
      // encode a block
      const block = await Block.encode({ value, codec, hasher })
      const res = await this.fdp.connection.bee.uploadData(this.fdp.connection.postageBatchId, block.bytes)

      callback(null, { reference: res.reference as Reference, cid: block.cid })
    } catch (err) {
      callback(err as Error)
    }
  }

  async loadDatabase(dbname: string, callback: (err: Error | null, args?: LoadDatabaseCallbackArgs) => void) {
    try {
      const bytes = await this.db.getTopic().get(dbname as Reference)
      const block = await Block.decode({ bytes, codec, hasher })

      callback(null, { data: block.value })
    } catch (err) {
      callback(err as Error)
    }
  }
}

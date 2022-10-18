import { CID } from 'multiformats/cid'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { assertBeesonCidReference, toSwarmRef } from '.'
import {
  AbstractDatabaseOptions,
  AbstractGetOptions,
  AbstractLevel,
  AbstractOpenOptions,
  AbstractPutOptions,
  NodeCallback,
} from 'abstract-level'

export interface OpenOptions extends AbstractOpenOptions {
  client: FdpStorage
}
/**
 * Fdp-Storage implemented as an AbstractLevel interface
 */
export class FdpStorageLevel extends AbstractLevel<string, CID, Uint8Array> {
  store!: FdpStorage
  public constructor(options?: AbstractDatabaseOptions<CID, Uint8Array>) {
    const _manifest = {
      encodings: { json: true },
    }
    super(_manifest, options)
  }

  _open(options: OpenOptions, callback: NodeCallback<void>) {
    this.store = options.client
    this.nextTick(callback)
  }

  _put(
    key: CID,
    val: Uint8Array,
    options: AbstractPutOptions<CID, Uint8Array>,
    callback: NodeCallback<void>,
  ) {
    if (this.store === null) {
      throw new Error('Datastore needs to be opened.')
    }
    try {
      const isValidCid = assertBeesonCidReference(key, val)
      if (!isValidCid) throw new Error(`Invalid CID: ${key}`)
      this.store.connection.bee.uploadData(this.store.connection.postageBatchId, val)
    } catch (err) {
      throw err
    }
    this.nextTick(callback)
  }

  _get(key: CID, options: AbstractGetOptions<CID, Uint8Array>, callback: NodeCallback<void>) {
    if (this.store === null) {
      throw new Error('Datastore needs to be opened.')
    }
    try {
      const ref = toSwarmRef(key)

      const value = this.store.connection.bee.downloadData(ref)
      this.nextTick(callback, null, value)
    } catch (err) {
      return this.nextTick(callback, new Error(`Key ${key} was not found`))
    }
  }

  async has(key: CID) {
    if (this.store === null) {
      throw new Error('Datastore needs to be opened.')
    }
    try {
      const swarmRef = toSwarmRef(key)

      return this.store.connection.bee.isReferenceRetrievable(swarmRef.toString())
    } catch (err: any) {
      if (err.code === 'ERR_NOT_FOUND') return false
      throw err
    }
  }
}

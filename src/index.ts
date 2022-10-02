import { AwaitIterable, BaseBlockstore } from 'blockstore-core/base'
import { Options, Pair, Batch, Query, KeyQuery } from 'interface-blockstore'
import { CID } from 'multiformats/cid'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { BeeSon } from '@fairdatasociety/beeson'
import { JsonValue } from '@fairdatasociety/beeson/dist/types'
export interface FdpStorageOptions extends Options {
  pod: string
  path: string
}

export function convertToBlock(beeson: BeeSon<JsonValue>) {
  return {
    ref: beeson.swarmHash(),
    cid: beeson.swarmHash(),
    data: beeson.serialize(),
  }
}
export class FdpStorageBlockstore extends BaseBlockstore {
  constructor(private fdp: FdpStorage) {
    super()
  }
  open(): Promise<void> {
    // no - op
    return Promise.resolve()
  }
  close(): Promise<void> {
    // no - op
    return Promise.resolve()
  }
  put(key: CID, val: Uint8Array, options: FdpStorageOptions): Promise<FileMetadata> {
    return this.fdp.file.uploadData(options.pod, key.toString(), val)
  }
  get(key: CID, options?: Options | undefined): Promise<Uint8Array> {
    throw new Error('Method not implemented.')
  }
  has(key: CID, options?: Options | undefined): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  delete(key: CID, options?: Options | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }
  putMany(source: AwaitIterable<Pair>, options?: Options | undefined): AsyncIterable<Pair> {
    throw new Error('Method not implemented.')
  }
  getMany(source: AwaitIterable<CID>, options?: Options | undefined): AsyncIterable<Uint8Array> {
    throw new Error('Method not implemented.')
  }
  deleteMany(source: AwaitIterable<CID>, options?: Options | undefined): AsyncIterable<CID> {
    throw new Error('Method not implemented.')
  }
  batch(): Batch {
    throw new Error('Method not implemented.')
  }
  _all(q: Query, options?: Options | undefined): AsyncIterable<Pair> {
    throw new Error('Method not implemented.')
  }
  _allKeys(q: KeyQuery, options?: Options | undefined): AsyncIterable<CID> {
    throw new Error('Method not implemented.')
  }
  query(q: Query, options?: Options | undefined): AsyncIterable<Pair> {
    throw new Error('Method not implemented.')
  }
  queryKeys(q: KeyQuery, options?: Options | undefined): AsyncIterable<CID> {
    throw new Error('Method not implemented.')
  }
}

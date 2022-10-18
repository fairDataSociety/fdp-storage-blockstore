import { Options, Pair, Batch, Query, KeyQuery } from 'interface-blockstore'
import { CID } from 'multiformats/cid'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import * as digest from 'multiformats/hashes/digest'
import { makeChunkedFile, ChunkAddress } from '@fairdatasociety/bmt-js'
import { AwaitIterable } from 'blockstore-core/dist/src/base'
import { BeeSon } from '@fairdatasociety/beeson'
import { codec, hasher } from '@fairdatasociety/beeson-multiformats'
import * as Block from 'multiformats/block'
import { JsonValue } from '@fairdatasociety/beeson/dist/types'
import { Reference } from '@ethersphere/swarm-cid'

/**
 * Asserts a beeson cid reference
 * @param cid cid
 * @param value value as Uint8Array
 * @returns true if the reference is a valid cid
 */
async function assertBeesonCidReference(cid: CID, value: Uint8Array): Promise<boolean> {
  const chunk = makeChunkedFile(value)
  const ref = chunk.address()

  const hash = digest.create(0x1b, ref).digest

  return cid.equals(hash)
}

/**
 * Converts array of number or Uint8Array to HexString without prefix.
 *
 * @param bytes   The input array
 * @param len     The length of the non prefixed HexString
 */
function bytesToHex(bytes: Uint8Array, len?: number): string {
  const hexByte = (n: number) => n.toString(16).padStart(2, '0')
  const hex = Array.from(bytes, hexByte).join('')
  if (len && hex.length !== len) {
    throw new TypeError(`Resulting HexString does not have expected length ${len}: ${hex}`)
  }

  return hex
}

/**
 * Get CID from Beeson helper
 * @param beeson beeson value
 * @returns A CID
 */
export async function getCidFromBeeson(beeson: BeeSon<JsonValue>): Promise<CID> {
  const value = beeson.serialize()
  const chunk = makeChunkedFile(value)
  const ref = chunk.address()

  return CID.decode(digest.create(0x1b, ref).digest)
}

/**
 * Get Swarm Reference from Beeson
 * @param beeson beeson value
 * @returns A Swarm Reference (chunk address)
 */
export async function getSwarmRefFromBeeson(beeson: BeeSon<JsonValue>): Promise<ChunkAddress> {
  const value = beeson.serialize()
  const chunk = makeChunkedFile(value)

  return chunk.address()
}

/**
 * Converts a swarm reference to cid
 * @param cid CID
 * @returns A swarm reference
 */
export function toSwarmRef(cid: CID): Reference {
  return bytesToHex(cid.multihash.digest) as Reference
}

export interface FdpStorageOptions extends Options {
  pod: string
  path: string
}

export class FdpStorageBlockstore {
  constructor(private fdp: FdpStorage) {}

  /**
   * Adds a block as beeson encoded
   * @param json
   * @returns
   */
  async putBeesonBlock(json: BeeSon<JsonValue>): Promise<CID> {
    // encode a block
    const block = await Block.encode({ value: json, codec, hasher })
    await this.put(block.cid, block.bytes)

    return block.cid
  }

  /**
   * Adds a block to fdp-storage
   * @param key
   * @param val
   */
  async put(key: CID, val: Uint8Array): Promise<void> {
    const isValidCid = assertBeesonCidReference(key, val)
    if (!isValidCid) throw new Error(`Invalid CID: ${key}`)
    this.fdp.connection.bee.uploadData(this.fdp.connection.postageBatchId, val)
  }

  /**
   * Reads a block from fdp-storage
   * @param key
   * @returns
   */
  async get(key: CID): Promise<Uint8Array> {
    const ref = toSwarmRef(key)

    return this.fdp.connection.bee.downloadData(ref)
  }

  /**
   * Reads a beeson block from fdp-storage
   * @param key
   * @returns
   */
  async getBeesonBlock(key: CID): Promise<BeeSon<JsonValue>> {
    const ref = toSwarmRef(key)
    const block = await this.fdp.connection.bee.downloadData(ref)
    const decoded = await Block.decode({
      bytes: block,
      codec,
      hasher,
    })

    return decoded.value
  }

  /**
   *
   * @param key
   * @param options
   * @returns
   */
  async has(key: CID, options?: Options | undefined): Promise<boolean> {
    const ref = toSwarmRef(key)

    return this.fdp.connection.bee.isReferenceRetrievable(ref.toString())
  }

  /**
   *
   * @param key
   * @param options
   */
  async delete(key: CID, options?: Options | undefined): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /**
   * Not implemented
   */
  async open(): Promise<void> {
    // no - op
    return Promise.resolve()
  }

  /**
   * Not implemented
   */
  async close(): Promise<void> {
    // no - op
    return Promise.resolve()
  }

  /**
   * Not implemented
   */
  putMany(source: AwaitIterable<Pair>, options?: Options | undefined): AsyncIterable<Pair> {
    throw new Error('Method not implemented.')
  }

  /**
   * Not implemented
   */
  getMany(source: AwaitIterable<CID>, options?: Options | undefined): AsyncIterable<Uint8Array> {
    throw new Error('Method not implemented.')
  }

  /**
   * Not implemented
   */
  deleteMany(source: AwaitIterable<CID>, options?: Options | undefined): AsyncIterable<CID> {
    throw new Error('Method not implemented.')
  }

  /**
   * Not implemented
   */
  batch(): Batch {
    throw new Error('Method not implemented.')
  }

  /**
   * Not implemented
   */
  _all(q: Query, options?: Options | undefined): AsyncIterable<Pair> {
    throw new Error('Method not implemented.')
  }

  /**
   * Not implemented
   */
  _allKeys(q: KeyQuery, options?: Options | undefined): AsyncIterable<CID> {
    throw new Error('Method not implemented.')
  }

  /**
   * Not implemented
   */
  query(q: Query, options?: Options | undefined): AsyncIterable<Pair> {
    throw new Error('Method not implemented.')
  }

  /**
   * Not implemented
   */
  queryKeys(q: KeyQuery, options?: Options | undefined): AsyncIterable<CID> {
    throw new Error('Method not implemented.')
  }
}

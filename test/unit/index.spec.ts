import { BatchId } from '@ethersphere/bee-js'
import { BeeSon, Type } from '@fairdatasociety/beeson'
import * as Block from 'multiformats/block'
import { FdpStorageLevel, OpenOptions } from '../../src/fdpstorage-level'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { codec, hasher } from '@fairdatasociety/beeson-multiformats'
import { JsonValue } from '@fairdatasociety/beeson/dist/types'

describe('fdp-storage-level', () => {
  let leveldown: FdpStorageLevel
  let block: Block.Block<any>
  const json = [0, 1, 2, 3, 5, 6]

  beforeEach(async () => {
    const id = `54ed0da82eb85ab72f9b8c37fdff0013ac5ba0bf96ead71d4a51313ed831b9e5` as BatchId
    const client = new FdpStorage('http://localhost:1633', id)

    leveldown = new FdpStorageLevel()
    await leveldown.open({
      client,
    } as OpenOptions)
  })

  it('when created should be defined', async () => {
    expect(leveldown).toBeDefined()
  })

  it('should put item', async () => {
    const beeson = new BeeSon({ json })
    expect(beeson.typeManager.type).toBe(Type.array)
    expect(beeson.json).toStrictEqual(json)

    const value = beeson
    // encode a block
    block = await Block.encode({ value, codec, hasher })
    await leveldown.put(block.cid, block.bytes)

    expect(json).toEqual(block.bytes.toString())
  })

  it('should get item', async () => {
    // get block
    const resp = await leveldown.get(block.cid)

    expect(json).toEqual(resp.toString())
  })
})

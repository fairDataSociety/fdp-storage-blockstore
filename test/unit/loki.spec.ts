import { BatchId } from '@ethersphere/bee-js'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { LokiFDPAdapter } from '../../src/lokifdp'
import { LokiPartitioningAdapter } from 'lokijs'
import loki from 'lokijs'
describe('loki fdp adapter', () => {
  let db: Loki

  beforeEach(() => {
    const id = `54ed0da82eb85ab72f9b8c37fdff0013ac5ba0bf96ead71d4a51313ed831b9e5` as BatchId
    const client = new FdpStorage('http://localhost:1633', id)

    const idbAdapter = new LokiFDPAdapter(client, 'swarmbee', 'fdp')
    const pa = new LokiPartitioningAdapter(idbAdapter, { paging: true })
    db = new loki('sandbox.db', { adapter: pa, autosave: true, autosaveInterval: 5000 })
  })

  it('when created should be defined', async () => {
    expect(db).toBeDefined()
  })

  it('should insert into collection', async () => {
    const users = await db.addCollection('users')
    users.insert({
      name: 'Odin',
      age: 50,
      address: 'Asgard',
    })

    // alternatively, insert array of documents
    users.insert([
      { name: 'Thor', age: 35 },
      { name: 'Loki', age: 30 },
    ])
    const results = users.find({ age: { $gte: 35 } })

    expect(results.length).toEqual(2)
  })

  it('should update collection', async () => {
    const users = await db.addCollection('users')
    const odin = users.insert({
      name: 'Odin',
      age: 50,
      address: 'Asgard',
    })

    // alternatively, insert array of documents
    users.insert([
      { name: 'Thor', age: 35 },
      { name: 'Loki', age: 30 },
    ])
    const results = users.find({ age: { $gte: 35 } })

    expect(results.length).toEqual(2)

    odin.age = 60
    users.update(odin)

    const results2 = users.find({ age: { $gte: 59 } })

    expect(results2.length).toEqual(1)
  })
})

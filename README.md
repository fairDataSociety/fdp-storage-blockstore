# fdp-storage-blockstore
IPLD store for Graphsync integrations


## How it works

### Use case 1: From beeson-multiformats blocks to destination IPLD codec blocks. Router exchange must support message hooks to translate one codec to another.
```
Node with custom IPLD (beeson-multiformats) ----> js-graphsync router exchange ----> Node with custom IPLD (destination IPLD codec)

```


### Use case 2: From origin codec blocks to beeson-multiformats blocks. Router exchange must support message hooks to translate one codec to another.
```
Node with custom IPLD (origin IPLD codec) ----> js-graphsync router exchange ----> Node with custom IPLD (beeson-multiformats)
```

## Dapp integration

```typescript


```
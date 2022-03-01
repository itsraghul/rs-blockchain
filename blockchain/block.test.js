const hexToBinary = require('hex-to-binary');
const Block = require('./block');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const { cryptoHash } = require('../util');

describe('Block', () => {
  const timestamp = 2000;
  const lastHash = '1233445';
  const hash = '2334556';
  const data = ['block1', 'block2', 'block3'];
  const nonce = 1;
  const difficulty = 1;
  const block = new Block({
    timestamp: timestamp,
    hash: hash,
    data: data,
    lastHash: lastHash,
    nonce: nonce,
    difficulty: difficulty,
  });

  it('Block contains all the properties', () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
  });

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();

    it('returns a block instance', () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it('returns the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe('mineBlock()', () => {
    const lastBlock = Block.genesis();
    const data = 'mined data';
    const mineBlock = Block.mineBlock({ lastBlock, data });

    it('returns a block instance', () => {
      expect(mineBlock instanceof Block).toBe(true);
    });

    it('mines a block and sets the `lastHash` to the `hash` of the last block', () => {
      expect(mineBlock.lastHash).toEqual(lastBlock.hash);
    });

    it('sets the data to the block', () => {
      expect(mineBlock.data).toEqual(data);
    });

    it('sets a timestamp to the block', () => {
      expect(mineBlock.timestamp).not.toEqual(undefined);
    });

    it('creates a SHA-256 hash based on proper inputs', () => {
      expect(mineBlock.hash).toEqual(
        cryptoHash(
          mineBlock.timestamp,
          mineBlock.nonce,
          mineBlock.difficulty,
          lastBlock.hash,
          data
        )
      );
    });

    it('sets a hash that matches the difficulty criteria', () => {
      expect(
        hexToBinary(mineBlock.hash).substring(0, mineBlock.difficulty)
      ).toEqual('0'.repeat(mineBlock.difficulty));
    });

    it('adjusts a difficulty', () => {
      const possibleResults = [
        lastBlock.difficulty + 1,
        lastBlock.difficulty - 1,
      ];
      expect(possibleResults.includes(mineBlock.difficulty)).toBe(true);
    });
  });

  describe('adjustDifficulty()', () => {
    it('raises the difficulty for quickly mined block', () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE - 100,
        })
      ).toEqual(block.difficulty + 1);
    });
    it('lowers the difficulty for slowly mined block', () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE + 100,
        })
      ).toEqual(block.difficulty - 1);
    });

    it('has a lower limit of one', () => {
      block.difficulty = -1;
      expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
    });
  });
});

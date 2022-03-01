const Blockchain = require('.');
const Block = require('./block');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');
const { cryptoHash } = require('../util');

describe('Blockchain', () => {
  let blockchain, newChain, originalChain, errorMock;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    errorMock = jest.fn();

    originalChain = blockchain.chain;
    global.console.error = errorMock;
  });

  it('contains a chain of blocks', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('starts with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('add a new block to chain', () => {
    const newData = 'foo';
    blockchain.addBlock({ data: newData });

    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });

  describe('isValidChain()', () => {
    describe('when the chain does not start with a genesis block', () => {
      it('returns false', () => {
        blockchain.chain[0] = { data: 'fake genesis block' };

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe('when the chain starts with the gensis block and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({ data: 'error' });
        blockchain.addBlock({ data: 'wears' });
        blockchain.addBlock({ data: 'cares' });
      });
      describe('and a lastHash  reference has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'broken-hash';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and chain contains a block with an invalid block field', () => {
        it('returns false', () => {
          blockchain.chain[2].data = 'rears';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with a jumped difficulty', () => {
        it('returns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0;
          const data = [];
          const difficulty = lastBlock.difficulty - 3;

          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

          const badBlock = new Block({
            timestamp,
            lastHash,
            difficulty,
            nonce,
            data,
          });

          blockchain.chain.push(badBlock);

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain does not contain any invalid blocks', () => {
        it('returns true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe('replaceChain()', () => {
    let logMock;

    beforeEach(() => {
      logMock = jest.fn();

      global.console.log = logMock;
    });
    describe('when thenew chain is not longer ', () => {
      beforeEach(() => {
        newChain.chain[0] = { new: 'chain' };
        blockchain.replaceChain(newChain.chain);
      });
      it('does not replace the chain', () => {
        expect(blockchain.chain).toEqual(originalChain);
      });

      it('logs an error', () => {
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('when the new chain is longer ', () => {
      beforeEach(() => {
        newChain.addBlock({ data: 'error' });
        newChain.addBlock({ data: 'wears' });
        newChain.addBlock({ data: 'cares' });
      });
      describe('when the chain is invalid', () => {
        beforeEach(() => {
          newChain.chain[2].hash = 'guhin';
          blockchain.replaceChain(newChain.chain);
        });
        it('does not replace the chain', () => {
          expect(blockchain.chain).toEqual(originalChain);
        });

        it('logs an error', () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });
      describe('when the chain is valid', () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        });
        it('does  replace the chain', () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });

        it('logs about the chain replacement', () => {
          expect(logMock).toHaveBeenCalled();
        });
      });
    });

    describe('and the validTransactions flag is true', () => {
      it('calls validTransactionsData()', () => {
        const validTransactionsDataMock = jest.fn();

        blockchain.validTransactionsData = validTransactionsDataMock;
        newChain.addBlock({ data: 'foo' });
        blockchain.replaceChain(newChain.chain, true);
        expect(validTransactionsDataMock).toHaveBeenCalled();
      });
    });
  });

  describe('validTransactionsData()', () => {
    let transaction, rewardedTransaction, wallet;

    beforeEach(() => {
      wallet = new Wallet();
      transaction = wallet.createTransaction({ recipient: 'foo', amount: 20 });
      rewardedTransaction = Transaction.rewardTransaction({
        minerWallet: wallet,
      });
    });

    describe('when the txn data is valid', () => {
      it('returns true', () => {
        newChain.addBlock({
          data: [transaction, rewardedTransaction],
        });

        expect(
          blockchain.validTransactionsData({ chain: newChain.chain })
        ).toBe(true);
        expect(errorMock).not.toHaveBeenCalled();
      });
    });

    describe('and the transaction data has multiple rewards', () => {
      it('should return false and logs error', () => {
        newChain.addBlock({
          data: [transaction, rewardedTransaction, rewardedTransaction],
        });
        expect(
          blockchain.validTransactionsData({ chain: newChain.chain })
        ).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('and the transaction data has atleast one malformed outputMap', () => {
      describe('and the transaction is not a reward transaction', () => {
        it('should return false  and log error', () => {
          transaction.outputMap[wallet.publicKey] = 90909808;
          newChain.addBlock({ data: [transaction, rewardedTransaction] });
          expect(
            blockchain.validTransactionsData({ chain: newChain.chain })
          ).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('and the transaction is  a reward transaction', () => {
        it('should return false and log error', () => {
          rewardedTransaction.outputMap[wallet.publicKey] = 2323;
          newChain.addBlock({ data: [transaction, rewardedTransaction] });
          expect(
            blockchain.validTransactionsData({ chain: newChain.chain })
          ).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });

    describe('and the txn data has atleast one malformed input', () => {
      it('should return false and logs and error', () => {
        wallet.balance = 9000;

        const evilOutputMap = {
          [wallet.publicKey]: 8900,
          fooRecipient: 100,
        };

        const evilTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(evilOutputMap),
          },
          outputMap: evilOutputMap,
        };
        newChain.addBlock({ data: [evilTransaction, rewardedTransaction] });
        expect(
          blockchain.validTransactionsData({ chain: newChain.chain })
        ).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('and a block contains multiple  identical transactions', () => {
      it('should return false and logs and error', () => {
        newChain.addBlock({
          data: [
            transaction,
            rewardedTransaction,
            transaction,
            transaction,
            transaction,
            transaction,
          ],
        });
        expect(
          blockchain.validTransactionsData({ chain: newChain.chain })
        ).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });
  });
});

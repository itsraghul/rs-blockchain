import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Transaction from './Transaction';
import history from '../history';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
  state = { transactionPoolMap: {} };

  fetchTransactionPoolMap = () => {
    fetch(`${document.location.origin}/api/transaction-pool-map`)
      .then((res) => res.json())
      .then((json) => this.setState({ transactionPoolMap: json }));
  };

  fetchMineTransactions = () => {
    fetch(`${document.location.origin}/api/mine-transactions`).then((res) => {
      if (res.status === 200) {
        alert('success');
        history.push('/blocks');
      } else {
        alert('The mine-transactions block request did not complete.');
      }
    });
  };

  componentDidMount() {
    this.fetchTransactionPoolMap();

    this.fetchPoolMapInterval = setInterval(
      () => this.fetchTransactionPoolMap(),
      POLL_INTERVAL_MS
    );
  }

  componentWillUnmount() {
    clearInterval(this.fetchPoolMapInterval);
  }
  render() {
    return (
      <div className="TransactionPool">
        <div>
          <Link to="/">Home</Link>
        </div>
        <br />
        <h2>Transaction Pool</h2>
        <br />
        {Object.values(this.state.transactionPoolMap).map((transaction) => {
          return (
            <div key={transaction.id}>
              <hr style={{ backgroundColor: 'white' }} />
              <Transaction transaction={transaction} />
            </div>
          );
        })}
        <hr style={{ backgroundColor: 'white' }} />
        <div>
          <Button
            variant="danger"
            size="lg"
            block
            onClick={this.fetchMineTransactions}
          >
            Mine the Transactions
          </Button>
        </div>
      </div>
    );
  }
}

export default TransactionPool;

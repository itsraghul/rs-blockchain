import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
  state = { displayTransaction: false };

  toggleTransaction = () => {
    this.setState({ displayTransaction: !this.state.displayTransaction });
  };

  get displayTransaction() {
    const { data } = this.props.block;
    const stringifiedData = JSON.stringify(data);
    const dataDisplay =
      stringifiedData.length > 65
        ? `${stringifiedData.substring(0, 65)}...`
        : stringifiedData;

    if (this.state.displayTransaction) {
      return (
        <div>
          {data.map((transaction) => (
            <div key={transaction.id}>
              <hr style={{ backgroundColor: 'white' }} />
              <Transaction transaction={transaction} />
            </div>
          ))}
          <br />
          <Button
            variant="outline-danger"
            size="sm"
            onClick={this.toggleTransaction}
          >
            Show Less
          </Button>
        </div>
      );
    }
    return (
      <div>
        <div>Data : {dataDisplay}</div>
        <br />
        <Button
          variant="outline-light"
          size="sm"
          onClick={this.toggleTransaction}
        >
          Show More
        </Button>
      </div>
    );
  }
  render() {
    const { timestamp, hash } = this.props.block;
    const hashDisplay = `${hash.substring(0, 15)}...`;

    return (
      <div className="Block">
        <div>Hash : {hashDisplay}</div>
        <div> timestamp : {new Date(timestamp).toLocaleString()}</div>
        {this.displayTransaction}
      </div>
    );
  }
}

export default Block;

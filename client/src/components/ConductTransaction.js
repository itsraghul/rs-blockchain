import React, { Component } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import history from '../history';

class ConductTransaction extends Component {
  state = { recipient: '', amount: 0 };

  updateRecipient = (event) => {
    this.setState({ recipient: event.target.value });
  };

  updateAmount = (event) => {
    this.setState({ amount: Number(event.target.value) });
  };

  conductTransaction = () => {
    const { recipient, amount } = this.state;
    fetch(`${document.location.origin}/api/transact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient, amount }),
    })
      .then((res) => res.json())
      .then((json) => {
        alert(json.message || json.type);
        history.push('/transaction-pool');
      });
    this.setState({ recipient: '', amount: 0 });
  };
  render() {
    return (
      <div className="ConductTransaction">
        <div>
          <Link to="/">Home</Link>
        </div>
        <br />
        <h2>Conduct a Transaction!</h2>
        <br />
        <Form>
          <Form.Group>
            <Form.Label>Recipient</Form.Label>
            <Form.Control
              type="text"
              placeholder="Address of recipient"
              value={this.state.recipient}
              onChange={this.updateRecipient}
            ></Form.Control>
          </Form.Group>
          <br />
          <Form.Group>
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="1"
              value={this.state.amount}
              onChange={this.updateAmount}
            ></Form.Control>
          </Form.Group>
          <br />
          <div>
            <Button
              variant="danger"
              size="lg"
              block
              onClick={this.conductTransaction}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default ConductTransaction;

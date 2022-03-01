import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default class App extends Component {
  state = { walletInfo: {} };

  componentDidMount() {
    fetch(`${document.location.origin}/api/wallet-info`)
      .then((res) => res.json())
      .then((json) => this.setState({ walletInfo: json }));
  }

  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div className="App">
        <div className="Title">RS CryptoChain</div>
        <img className="logo" src={logo}></img>
        <br />
        <div>
          <Link to="/blocks">Blocks</Link>
        </div>
        <br />
        <div>
          <Link to="/conduct-transaction">Conduct a Transaction</Link>
        </div>
        <br />
        <div>
          <Link to="/transaction-pool">Transaction Pool</Link>
        </div>
        <br />
        <div className="WalletInfo">
          <div>Address: {address}</div>
          <div>Balance: {balance}</div>
        </div>
        <br />
      </div>
    );
  }
}

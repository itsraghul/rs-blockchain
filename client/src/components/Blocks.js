import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Block from './Block';

export default class Blocks extends Component {
  state = { blocks: [] };
  componentDidMount() {
    fetch(`${document.location.origin}/api/blocks`)
      .then((response) => response.json())
      .then((json) => {
        this.setState({ blocks: json });
      });
  }
  render() {
    return (
      <div className="App">
        <div>
          <Link to="/">Home</Link>
        </div>
        <br />
        <h2>Blocks</h2>
        {this.state.blocks.map((block) => {
          return <Block key={block.hash} block={block} />;
        })}
      </div>
    );
  }
}

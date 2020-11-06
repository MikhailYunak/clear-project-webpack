import React from 'react';
import { render } from 'react-dom';
import Post from './models/Post';
import WebpackLogo from './assets/webpack-logo.png';
import './styles/styles.css';
import './styles/scss.scss';
import './styles/less.less';

const post = new Post('Webpack Post title', WebpackLogo);
document.getElementsByTagName('pre').innerHTML = post.toString();

const App = () => (
  <div className="container">
    <h1>Hello world!</h1>
    <hr />
    <div className="logo"> </div>
    <hr />
    <pre className="code">{post.toString()}</pre>
    <hr />
    <div className="box">
      <h2>LESS</h2>
    </div>
    <hr />
    <div className="card">
      <h2>SCSS</h2>
    </div>
  </div>
);

render(<App />, document.getElementById('app'));

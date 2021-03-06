'use strict';

const React = require('react');
const { Link } = require('react-router-dom');

class Brand extends React.PureComponent {
	render() {
		return (
			<React.Fragment>
				<img className="brand" src="/static/images/icon-cite.png" alt="Logo" />					
				<h1 className="brand">
					Mick Schroeder's<br/>
					Citation Generator
				</h1>
			</React.Fragment>
		);
	}
}

module.exports = Brand;

import React from 'react'

class TableRow extends React.Component {
  render () {
    return (
      <tr>
        <th scope='row'>{this.props.index}</th>
        <td>
          <span className="home">{this.props.home}</span>
          <span className="home-goals">({this.props.home_goals})</span>
          v
          <span className="away-goals">({this.props.away_goals})</span>
          <span className="away">{this.props.away}</span>
        </td>
        <td className="text-success">{this.props.positive}</td>
        <td className="text-danger">{this.props.negative}</td>
        <td>{this.props.total}</td>
      </tr>
    );
  }
}

module.exports = TableRow 

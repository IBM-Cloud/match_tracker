import React from 'react'

class GameweekStats extends React.Component {
  render () {
    let total = 0, positive = 0, negative = 0, fixtures = this.props.data.length
    this.props.data.forEach((row) => {
      total += row.total
      positive += row.positive
      negative += row.negative
    })
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Gameweek Statistics</h3>
        </div>
        <div className="panel-body">
          <p className="lead">We have collected {total} tweets about {fixtures} fixtures.</p>
          <p className="lead text-success">{positive} have been classified as having positive sentiment.</p>
          <p className="lead text-danger">{negative} have been classified as having negative sentiment.</p>
        </div>
      </div>
    )
  }
}

module.exports = GameweekStats

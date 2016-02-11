import React from 'react'
import TableRow from './TableRow'

class Table extends React.Component {
  render () {
    let rows = this.props.data.map((row, idx) => {
      return <TableRow index={idx+1} total={row.total} positive={row.positive} negative={row.negative} home_goals={row.home_goals} away_goals={row.away_goals} home={row.home} away={row.away} key={row.home+row.away}/>
    })

    return (
      <table className="table table-striped table-bordered">  
        <thead> 
          <tr>
            <th className="position">#</th>
            <th className="fixtures">Fixture</th>
            <th className="positive">PT</th>
            <th className="negative">NT</th>
            <th className="total">Tweets</th></tr> 
        </thead> 
        <tbody>
          {rows}
        </tbody> 
      </table>
    );
  }
}

module.exports = Table

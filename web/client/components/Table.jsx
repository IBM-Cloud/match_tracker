/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

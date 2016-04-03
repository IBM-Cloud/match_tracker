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

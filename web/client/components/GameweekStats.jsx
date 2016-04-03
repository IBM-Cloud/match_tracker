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

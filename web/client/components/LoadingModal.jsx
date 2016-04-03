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

class LoadingModal extends React.Component {

  componentDidUpdate() {
    $(this._modal).modal(this.props.loading ? 'show': 'hide')
  }

  render () {
    return (
      <div ref={(c) => this._modal = c} className="modal fade bs-example-modal-sm">
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Loading Gameweek Data.</h4>
            </div>
            <div className="modal-body">
              <p><span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>We won't be a minute....</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = LoadingModal

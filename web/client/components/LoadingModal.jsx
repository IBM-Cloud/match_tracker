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

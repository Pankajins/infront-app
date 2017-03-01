import React, { PropTypes } from 'react';
import Annyang from 'annyang';

export default class InFront extends React.Component {

  /**
   * @param props - Comes from your rails view.
   * @param _railsContext - Comes from React on Rails
   */
  constructor(props, _railsContext) {
    super(props);

    // How to set initial state in ES6 class syntax
    // https://facebook.github.io/react/docs/reusable-components.html#es6-classes
    this.state = {
      image: false,
      labels: []
    };
  }

  // After action call to annyang
  componentDidMount() {
    Annyang.addCommands({
      'capture': () => {
        this.capture();
      }
    });
    Annyang.start();
  }

  capture() {
    const constraints = {
        video: {
          facingMode: 'environment'
        }
    }

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      /* use the stream */

      const video = document.createElement('video');
      video.setAttribute('width', 640);
      video.setAttribute('height', 480);
      video.srcObject = stream;
      video.play();

      video.addEventListener('canplay', () => {
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.setAttribute('width', 640);
          canvas.setAttribute('height', 480);
          const context = canvas.getContext('2d');

          context.drawImage(video, 0, 0, 640, 480);

          const image = canvas.toDataURL('image/png');

          this.setState({
            labels: [],
            image: image
          });
          stream.getTracks()[0].stop();
          this.postImage(image);
        }, 100);
      });
    }).catch((err) => {
      /* handle the error */
    });
  }

  postImage(image) {
    fetch('/detections', {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        image: image.replace('data:image/png;base64,', '')
      })
    }).then(response => response.json()).then((data) => {
      this.setState({
        labels: data['labels']
      });
    });
  }

  render() {
    return (
      <div>
        <p>Hi</p>
        <button onClick={this.capture.bind(this)}>capture</button>
        {this.state.image ? <img src={this.state.image} alt="image"/> : ''}
        {this.renderLabels()}
      </div>
    );
  }

  renderLabels() {
    if (!this.state.labels) {
      return null;
    }

    let list = this.state.labels.map((label, index) => {
      return(
        <li key={index}>{label}</li>
      )
    });

    return <ul className="labels">{list}</ul>
  }
}

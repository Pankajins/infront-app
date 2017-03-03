import React, { PropTypes } from 'react';
import Annyang from 'annyang';
import 'webrtc-adapter';
import Particles from './Particles';
import {Howl} from 'howler';

export default class InFront extends React.Component {

  /**
   * @param props - Comes from your rails view.
   * @param _railsContext - Comes from React on Rails
   */
  constructor(props, _railsContext) {
    super(props);

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
    Annyang.debug(true);
    Annyang.start();

    const particles = new Particles(this.particles_container);

    const audio = new Howl({
      src: ['audio.mp3']
    });
    audio.play();
  }

  capture() {
    const constraints = {
      video: {
        facingMode: 'environment'
      }
    }

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.addEventListener('playing', () => {
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.setAttribute('width', video.videoWidth);
          canvas.setAttribute('height', video.videoHeight);
          const context = canvas.getContext('2d');

          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

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

        <div className="particles" ref={(input) => {this.particles_container = input}}></div>
        <div className="container">
          <header>
            <img src="/logo.svg" alt="infront application logo" />
          </header>

          <div className="results" aria-live="true">
            {this.state.image ? <img src={this.state.image} alt="picture of surroundings"/> : ''}
            {this.renderLabels()}
          </div>

          <div className="cta">
            <button className="capture" onClick={this.capture.bind(this)}>CAPTURE</button>
            <p className="warning">This is a highly experimental demo</p>
            <p className="warning">Exclusive for Google Chrome and some Android devices</p>
          </div>
        </div>
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

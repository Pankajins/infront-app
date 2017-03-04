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

    // Instantiate the particles class
    const particles = new Particles(this.particles_container);

    // Howler is used to play an initial audio message
    const audio = new Howl({
      src: ['audio.mp3']
    });
    audio.play();
  }

  // The capture function takes a picture, makes it a video that is placed into a canvas which is displayed on the screen and posted to rails
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

      // Video needs time to play first before an image is captured, this required a timeout.
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

  // Posts data (img) from React to Rails: gets response, then calls the speakLabels function which pronounces the results coming from Amazon Rekognition
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
      this.speakLabels(data.labels);
    });
  }

  speakLabels(labels) {
    if (window.speechSynthesis) {
      labels.forEach((label, i) => {
        setTimeout(() => {
          const text = new SpeechSynthesisUtterance(label);
          window.speechSynthesis.speak(text);
        }, 500 * i);
      });
    }
  }

  // All components have a render function whose function is to return HTML which is injected into the index.html file (which is just a container for the html produced by the React components)
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

  // Basically if there's no labels nothing is returned. If there are labels, it creates an array of li tags which are then placed into a ul tag and returned. 
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

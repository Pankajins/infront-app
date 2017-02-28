import React, { PropTypes } from 'react';

export default class InFront extends React.Component {

  /**
   * @param props - Comes from your rails view.
   * @param _railsContext - Comes from React on Rails
   */
  constructor(props, _railsContext) {
    super(props);

    // How to set initial state in ES6 class syntax
    // https://facebook.github.io/react/docs/reusable-components.html#es6-classes
    this.state = { };
  }

  // updateName = (name) => {
  //   this.setState({ name });
  // };

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
          console.log(image);

          this.setState({
            image: image
          });
        }, 100);
      });

    }).catch((err) => {
      /* handle the error */
    });
  }

  render() {
    return (
      <div>
        <p>Hi</p>
        <button onClick={this.capture.bind(this)}>capture</button>
        {this.state.image ? <img src={this.state.image} alt="image"/> : ''}
      </div>
    );
  }
}

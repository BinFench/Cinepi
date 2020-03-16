import React, { PureComponent } from 'react';
import Carousel from '@brainhubeu/react-carousel';
import '@brainhubeu/react-carousel/lib/style.css';
import './App.css';
import axios from 'axios';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
 
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

const diff = (diffMe, diffBy) => diffMe.split(diffBy).join('');

class App extends PureComponent {
  state = {
    catalogue: [],
    loaded: false,
    modalIsOpen: false,
    modalContent: <div></div>,
    video: 0,
  }

  epSelect = index => {
    return () => {
      this.setState({
        modalContent: (
          <div id="player">
            <video id="videoPlayer" controls autoplay> 
              <source src={"http://localhost:4000/catalogue/" + this.state.video + "-" + index} type="video/mp4" />
            </video>
          </div>),
        modalIsOpen: true
      });
    }
  }

  clickHandler = index => {
    return () => {
      this.setState({video: index})
      if (this.state.catalogue[index].videos.length !== 1) {
        this.setState({
          modalContent: (
            <Carousel arrows slidesPerPage={5}>
              {this.state.catalogue[index].videos.map((item, num) => {
                return (
                  <div key={num} className="ui card" onClick={this.epSelect(num)}>
                    <div className="content">
                      <a id="title" className="header">{diff(item, this.state.catalogue[index].relativePath)}</a>
                    </div>
                  </div>
                )
              })}
            </Carousel>
          ),
          modalIsOpen: true
        })
      } else {
        this.setState({
          modalContent: (
            <div id="player">
              <video id="videoPlayer" controls autoplay> 
                <source src={"http://localhost:4000/catalogue/" + index + "-" + 0} type="video/mp4" />
              </video>
            </div>),
          modalIsOpen: true
        })
      }
    }
  }
  
  componentDidMount() {
    axios.get(`http://localhost:4000/catalogue/`)
      .then(res => {
        const catalogue = res.data.data;
        this.setState({ catalogue,
        loaded: true });
      })
      Modal.setAppElement('body');
  }

  render() {
    if (this.state.loaded === true) {
      return (
        <div className="App">
          <Carousel
          arrows
          slidesPerPage={5}>
            {this.state.catalogue.map((item, index) => {
              return (
                <div key={index} className="ui card" onClick={this.clickHandler(index)}>
                  <div className="image">
                    <img src={"http://localhost:4000/" + diff(item.img, item.absPath)} alt={diff(item.img, item.absPath)}/>
                  </div>
                  <div className="content">
                    <a id="title" className="header">{diff(item.name, item.relativePath).substring(0, 21)}</a>
                  </div>
                </div>
              );
            })}
          </Carousel>
          <Modal 
            isOpen={this.state.modalIsOpen}
            style={customStyles}
            onRequestClose={() => {
              this.setState({
                modalIsOpen: false,
                video: 0,
                modalContent: <div></div>
              });
            }}
          >
            {this.state.modalContent}
          </Modal>
        </div>
      );
    }
    return <div></div>
  }
  
}

export default App;

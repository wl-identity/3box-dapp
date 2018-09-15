import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import ipfsAPI from 'ipfs-api';
import PropTypes from 'prop-types';
// import Buffer from 'buffer/'.Buffer;
// import { bindActionCreators } from 'redux';

import { openBox, getPublicName, getPublicGithub, getPublicImage, getPrivateEmail } from '../state/actions';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import './styles/EditProfile.css';
import * as routes from '../utils/routes';
import Modal from '../components/Modal';

const Buffer = require('buffer/').Buffer;

class EditProfile extends Component {
  constructor(props) {
    super(props);
    const { name, github, email } = this.props;
    this.state = {
      name: name || '',
      github: github || '',
      email: email || '',
      buffer: null,
      showPicModal: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(props) {
    const { name, github } = props;
    this.setState({ name, github });
  }

  handleFormChange = (e, property) => {
    this.setState({ [property]: e.target.value });
  }

  handleUpdatePic = (photoFile) => {
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(photoFile);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer.from(reader.result) });
    };
  }

  handleSubmitPic = (e) => {
    const { buffer } = this.state;
    const { threeBoxObject } = this.props;
    const { profileStore } = threeBoxObject;

    const ipfs = ipfsAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

    e.preventDefault();

    ipfs.files.add(buffer, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      this.setState({ ipfsHash: res[0].hash, showPicModal: false });
      profileStore.set('image', [{ '@type': 'ImageObject', contentUrl: { '/': res[0].hash } }])
        .then(result => console.log(result))
        .then(() => this.props.getPublicImage());
    });
  }

  handlePicModal = () => {
    const { showPicModal } = this.state;
    this.setState({ showPicModal: !showPicModal });
  }

  removeStore = (key, method) => {
    const { threeBoxObject } = this.props;
    const { profileStore, privateStore } = threeBoxObject;

    if (method === 'profileStore') {
      profileStore.remove(key)
        .then(() => this.props.openBox());
    } else {
      privateStore.remove(key)
        .then(() => this.props.openBox());
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { name, github, email } = this.state;
    const { history, threeBoxObject } = this.props;
    const { profileStore, privateStore } = threeBoxObject;

    name && await profileStore.set('name', name);
    github && await profileStore.set('github', github)
    email && await privateStore.set('email', email)
    name && await this.props.getPublicName();
    github && await this.props.getPublicGithub();
    email && await this.props.getPrivateEmail();
    history.push(routes.PROFILE);
  }

  render() {
    const {
      image,
    } = this.props;
    const { showPicModal, name, github, email } = this.state;

    const address = web3.eth.accounts[0]; // eslint-disable-line no-undef

    console.log(this.props);
    console.log(this.state);

    return (
      <div>
        {showPicModal
          && (
            <div className="container">
              <div className="modal">
                <form onSubmit={this.handleSubmitPic}>
                  <input type="file" name="pic" accept="image/*" onChange={e => this.handleUpdatePic(e.target.files[0])} />
                  <button type="submit" />
                </form>
                <button onClick={e => this.handlePicModal(e)} type="button">close</button>
              </div>
            </div>)}

        <Nav />
        <div id="edit">
          <Link to="/Profile">
            <button id="goBack" type="button">
              &larr; Go back to profile
            </button>
          </Link>
          <p className="header">Edit Profile</p>

          <div id="edit_user_picture_edit">
            <img src={image.length > 0 ? `https://ipfs.io/ipfs/${image[0].contentUrl['/']}` : undefined} id="edit_user_picture" alt="profile" />
            <button onClick={this.handlePicModal} type="button">Edit photo</button>
          </div>

          <form onSubmit={e => this.handleSubmit(e)}>

            <div id="edit_field">

              <p className="subheader">PUBLIC</p>
              <p className="subtext">This information is public for all to see.</p>

              <div className="edit_form">

                <h3>Ethereum Address</h3>
                <p>{address}</p>

                <div className="edit_form_spacing" />

                <h3>Name</h3>
                <input
                  name="name"
                  type="text"
                  value={name}
                  onChange={e => this.handleFormChange(e, 'name')}
                />
                <button type="button" onClick={() => this.removeStore('name', 'profileStore')}>X</button>

                <div className="edit_form_spacing" />

                <h3>Github</h3>
                <input
                  name="github"
                  type="text"
                  value={github}
                  onChange={e => this.handleFormChange(e, 'github')}
                />
                <button type="button" onClick={() => this.removeStore('github', 'profileStore')}>X</button>

              </div>

              <p className="subheader">PRIVATE</p>
              <p className="subtext">This information is accessible only by those with permission.</p>

              <div className="edit_form">
                <h3>Email Address</h3>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => this.handleFormChange(e, 'email')}
                />
                <button type="button" onClick={() => this.removeStore('email', 'privateStore')}>X</button>

              </div>

            </div>

            <button type="submit">Save</button>
            <Link to="/Profile" className="subtext" id="edit_cancel">
              Cancel
            </Link>
          </form>
        </div>
        <Footer />
      </div>
    );
  }
}

EditProfile.propTypes = {
  threeBoxObject: PropTypes.object,
  name: PropTypes.string,
  github: PropTypes.string,
  email: PropTypes.string,
  image: PropTypes.array,
  openBox: PropTypes.func,
  history: PropTypes.object,

  getPublicName: PropTypes.func,
  getPublicGithub: PropTypes.func,
  getPublicImage: PropTypes.func,
  getPrivateEmail: PropTypes.func,
};

EditProfile.defaultProps = {
  threeBoxObject: {},
  name: '',
  github: '',
  email: '',
  image: [],
  history: {},

  openBox: openBox(),
  getPublicName: getPublicName(),
  getPublicGithub: getPublicGithub(),
  getPublicImage: getPublicImage(),
  getPrivateEmail: getPrivateEmail(),
};

function mapState(state) {
  return {
    threeBoxObject: state.threeBoxData.threeBoxObject,
    name: state.threeBoxData.name,
    github: state.threeBoxData.github,
    email: state.threeBoxData.email,
    image: state.threeBoxData.image,
  };
}

// function mapDispatch(dispatch) {
// return bindActionCreators({ updateUser }, dispatch);
// }

export default withRouter(connect(mapState, { openBox, getPublicName, getPublicGithub, getPublicImage, getPrivateEmail })(EditProfile));


// if (name && github) {
//   profileStore.set('name', name)
//     .then(() => profileStore.set('github', github))
//     .then(() => this.props.openBox())
//     .then(() => history.push(routes.PROFILE));
// } else if (name) {
//   profileStore.set('name', name)
//     .then(() => this.props.openBox())
//     .then(() => history.push(routes.PROFILE));
// } else if (github) {
//   profileStore.set('github', github)
//     .then(() => this.props.openBox())
//     .then(() => history.push(routes.PROFILE));
// }
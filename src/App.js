import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Menu, Dropdown, Icon, Button } from 'antd';
import { Bypasser, noiseGenerator } from './Demos';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isPlaying: false,
      processor:null,
      node: null,
      moduleLoaded: false,
      status: null
    };
  }

  async loadModule() {
    const { state, actx } = this;
    try {
      console.log(`worklet/${state.processor.module}.js`);
      await actx.audioWorklet.addModule(`worklet/${state.processor.module}.js`);
      this.setState({
        moduleLoaded: true,
        status: null,
      });
      console.log(`loaded module ${state.processor.module}`);
    } catch(e) {
      this.setState({moduleLoaded: false});
      console.log(`Failed to load module ${state.processor.module}`, e);
    }
  }

  handleSelect(name, processor) {
    if (this.state.isPlaying) {
      return;
    }
    this.setState({
      processor: {name, module: processor.name, cb: processor.cb },
      moduleLoaded: false,
      status: 'Loading module, please wait...'
    }, () => {
      if (!this.actx) {
        try {
          console.log('New context instantiated');
          this.actx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
          console.error(e);
        }
      }
      this.loadModule();
    });
  }

  toggleNode(){
    const { state } = this;
    if(state.isPlaying) {
      console.log(`stopping ${state.processor.module}`)
      state.node.port.postMessage(false)
    } else {
      console.log(`playing ${state.processor.module}`)
      const node = state.processor.cb(this);
      this.setState({ node });
      node.port.postMessage(true);          
    }
    this.setState({isPlaying: !state.isPlaying });    
  }

  render() {
    const { state } = this;
    const menu  = (
      <Menu onClick={(e) => this.handleSelect(e.item.props.name, e.item.props.processor)} selectedKeys={[this.state.current]}>
        <Menu.Item name="Bypass Filter" processor={{name: 'bypass-processor', cb: Bypasser }}>
          Bypass Filter
        </Menu.Item>
        <Menu.Item name="Noise" processor={{name:'noise-generator', cb: noiseGenerator }}>
          Noise
        </Menu.Item>
      </Menu>
    );
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <span>React + AudioWorklet = ❤</span>
          <div style={{float:'left', width:'100%'}}>
            <Dropdown overlay={menu} size='small'>
              <a className="ant-dropdown-link" href="#">
                {state.processor ? state.processor.name: 'Select a module'} <Icon type="down"/>
              </a>
            </Dropdown>
            <Button ghost disabled={!state.moduleLoaded}
              onClick={() => this.toggleNode()}
              style={{marginLeft: '1%', color: 'white'}}
              >{ state.isPlaying ? 'Stop' : 'Start' }</Button>
            <br/>
            <small>{state.status}</small>
          </div>
        </header>
      </div>
    );
  }
}

export default App;

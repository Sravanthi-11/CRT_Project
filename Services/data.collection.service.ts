import { Injectable } from '@angular/core';
@Injectable()
export class TealiumUtagService {
  scriptSrc = '';

  /*
  This service dictates how the component view initializes the script for the data collection 
  the code is from the documentation of https://github.com/Tealium/integration-angular
  We only need to setup config at the component end by providing a provider and initializing at 
  constructor and view at oninit
  
  for changing the service to a different service this class can be altered to change it as per requirement 
  
  
  */

  // Typically set "noview" flag (no first page automatic view event) to true for Single Page Apps (SPAs)
  constructor() {
    ( window as any).utag_cfg_ovrd = { noview : true };
    ( window as any).utag_data = {};
  }

  // Generic script loader with callback
  getScript( src: string, callback: () => void ) {
    const d = document;
    const fn = () => {};
    const o = { callback: callback || fn };
    let s: any;
    let t: any;

    if ( typeof src === 'undefined' ) {
      return;
    }

    s = d.createElement('script'); s.language = 'javascript'; s.type = 'text/javascript'; s.async = 1; s.charset = 'utf-8'; s.src = src;
    if ( typeof o.callback === 'function' ) {
      if ( d.addEventListener ) {
        s.addEventListener('load', () => {o.callback(); }, false);
      } else {
        // old IE support
        s.onreadystatechange = function(){
          if (this.readyState === 'complete' || this.readyState === 'loaded'){this.onreadystatechange = null; o.callback(); }
        };
      }
    }
    t = d.getElementsByTagName('script')[0];
    t.parentNode.insertBefore(s, t);
  }

  // Config settings used to build the path to the utag.js file
  setConfig(config: {account: string, profile: string, environment: string}) {
    if ( config.account !== undefined && config.profile !== undefined && config.environment !== undefined ) {
      this.scriptSrc = 'https://tags.tiqcdn.com/utag/' + config.account + '/' + config.profile + '/' + config.environment + '/utag.js';
    }
  }

  // Data layer is optional set of key/value pairs
  track(tealiumEvent: string, data?: any) {
    if ( this.scriptSrc === '' ) {
      console.log('Tealium config not set.');
      return;
    }
    if ( ( window as any).utag === undefined ) {
      this.getScript( this.scriptSrc, () => {
        ( window as any).utag.track( tealiumEvent, data );
      });
    } else {
      ( window as any).utag.track( tealiumEvent, data );
    }
  }

  view(data?: any) {
    this.track('view', data);
  }

  link(data?: any) {
    this.track('link', data);
  }
}
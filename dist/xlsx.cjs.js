"use strict";
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */var t=function(e,r){return(t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r])})(e,r)};function e(e,r){function n(){this.constructor=e}t(e,r),e.prototype=null===r?Object.create(r):(n.prototype=r.prototype,new n)}var r=function(){return(r=Object.assign||function(t){for(var e,r=1,n=arguments.length;r<n;r++)for(var o in e=arguments[r])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t}).apply(this,arguments)};function n(){for(var t=0,e=0,r=arguments.length;e<r;e++)t+=arguments[e].length;var n=Array(t),o=0;for(e=0;e<r;e++)for(var i=arguments[e],s=0,a=i.length;s<a;s++,o++)n[o]=i[s];return n}var o,i="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,s="undefined"!=typeof Buffer,a="undefined"!=typeof Uint8Array;if("undefined"==typeof ArrayBuffer)o=!1;else try{var u=new ArrayBuffer(0);o=0===new Blob([u],{type:"application/zip"}).size}catch(t){o=!1}var l={base64:!0,array:!0,string:!0,arraybuffer:i,nodebuffer:s,uint8array:a,blob:o},c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var h="function"==typeof setImmediate?setImmediate:(...t)=>{t.splice(1,0,0),setTimeout(...t)};function f(t,e){for(var r=0;r<t.length;++r)e[r]=255&t.charCodeAt(r);return e}function p(t){if(!l[t.toLowerCase()])throw new Error(t+" is not supported by this platform")}function d(t){return t}var m={stringifyByChunk:function(t,e,r){var n=[],o=0,i=t.length;if(i<=r)return String.fromCharCode.apply(null,t);for(;o<i;)"array"===e||"nodebuffer"===e?n.push(String.fromCharCode.apply(null,t.slice(o,Math.min(o+r,i)))):n.push(String.fromCharCode.apply(null,t.subarray(o,Math.min(o+r,i)))),o+=r;return n.join("")},stringifyByChar:function(t){for(var e="",r=0;r<t.length;r++)e+=String.fromCharCode(t[r]);return e},applyCanBeUsed:{uint8array:function(){try{return l.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(t){return!1}}()}};function y(t){return"string"==typeof t?"string":Array.isArray(t)?"array":l.uint8array&&t instanceof Uint8Array?"uint8array":l.arraybuffer&&t instanceof ArrayBuffer?"arraybuffer":void 0}function g(t){var e=65536,r=y(t),n=!0;if("uint8array"===r&&(n=m.applyCanBeUsed.uint8array),n)for(;e>1;)try{return m.stringifyByChunk(t,r,e)}catch(t){e=Math.floor(e/2)}return m.stringifyByChar(t)}function v(t,e){for(var r=0;r<t.length;r++)e[r]=t[r];return e}var b={};function w(t,e){if(e||(e=""),!t)return e;p(t);var r=y(e);return b[r][t](e)}function x(t,e,r){h((function(){t.apply(r||null,e||[])}))}function _(t,e){return Promise.resolve(t).then((function(t){return e&&(t=function(t){var e,r,n,o,i,s,a=0,u=0;if("data:"===t.substr(0,"data:".length))throw new Error("Invalid base64 input, it looks like a data url.");var h,f=3*(t=t.replace(/[^A-Za-z0-9\+\/\=]/g,"")).length/4;if(t.charAt(t.length-1)===c.charAt(64)&&f--,t.charAt(t.length-2)===c.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(h=l.uint8array?new Uint8Array(0|f):new Array(0|f);a<t.length;)e=c.indexOf(t.charAt(a++))<<2|(o=c.indexOf(t.charAt(a++)))>>4,r=(15&o)<<4|(i=c.indexOf(t.charAt(a++)))>>2,n=(3&i)<<6|(s=c.indexOf(t.charAt(a++))),h[u++]=e,64!==i&&(h[u++]=r),64!==s&&(h[u++]=n);return h}(t)),t}))}function S(t){return function(t){var e,r,n,o,i=t.length,s=0;for(n=0;n<i;n++)55296==(64512&(e=t.charCodeAt(n)))&&n+1<i&&56320==(64512&(r=t.charCodeAt(n+1)))&&(e=65536+(e-55296<<10)+(r-56320),n++),s+=e<128?1:e<2048?2:e<65536?3:4;o=l.uint8array?new Uint8Array(s):new Array(s);for(var a=0,u=0;a<s;u++)55296==(64512&(e=t.charCodeAt(u)))&&u+1<i&&56320==(64512&(r=t.charCodeAt(u+1)))&&(e=65536+(e-55296<<10)+(r-56320),u++),e<128?o[a++]=e:e<2048?(o[a++]=192|e>>>6,o[a++]=128|63&e):e<65536?(o[a++]=224|e>>>12,o[a++]=128|e>>>6&63,o[a++]=128|63&e):(o[a++]=240|e>>>18,o[a++]=128|e>>>12&63,o[a++]=128|e>>>6&63,o[a++]=128|63&e);return o}(t)}b.string={string:d,array:function(t){return f(t,new Array(t.length))},arraybuffer:function(t){return b.string.uint8array(t).buffer},uint8array:function(t){return f(t,new Uint8Array(t.length))}},b.array={string:g,array:d,arraybuffer:function(t){return new Uint8Array(t).buffer},uint8array:function(t){return new Uint8Array(t)}},b.arraybuffer={string:function(t){return g(new Uint8Array(t))},array:function(t){return v(new Uint8Array(t),new Array(t.byteLength))},arraybuffer:d,uint8array:function(t){return new Uint8Array(t)}},b.uint8array={string:g,array:function(t){return v(t,new Array(t.length))},arraybuffer:function(t){return t.buffer},uint8array:d},b.nodebuffer={string:g,array:function(t){return v(t,new Array(t.length))},arraybuffer:function(t){return b.nodebuffer.uint8array(t).buffer},uint8array:function(t){return v(t,new Uint8Array(t.length))},nodebuffer:d};var k={base64:!1,binary:!1,dir:!1,createFolders:!0,date:null,compression:null,compressionOptions:null,unixPermissions:null,dosPermissions:null},A=function(){function t(t){void 0===t&&(t="default"),this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null,this.name=t}return t.prototype.push=function(t){this.emit("data",t)},t.prototype.end=function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(t){this.emit("error",t)}return!0},t.prototype.error=function(t){return!this.isFinished&&(this.isPaused?this.generatedError=t:(this.isFinished=!0,this.emit("error",t),this.previous&&this.previous.error(t),this.cleanUp()),!0)},t.prototype.on=function(t,e){return this._listeners[t].push(e),this},t.prototype.cleanUp=function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners={data:[],end:[],error:[]}},t.prototype.emit=function(t,e){if(this._listeners[t])for(var r=0;r<this._listeners[t].length;r++)this._listeners[t][r].call(this,e)},t.prototype.pipe=function(t){return t.registerPrevious(this)},t.prototype.registerPrevious=function(t){var e=this;if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");return this.streamInfo=t.streamInfo,this.mergeStreamInfo(),this.previous=t,t.on("data",(function(t){e.processChunk(t)})),t.on("end",(function(){e.end()})),t.on("error",(function(t){e.error(t)})),this},t.prototype.pause=function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},t.prototype.resume=function(){if(!this.isPaused||this.isFinished)return!1;this.isPaused=!1;var t=!1;return this.generatedError&&(this.error(this.generatedError),t=!0),this.previous&&this.previous.resume(),!t},t.prototype.flush=function(){},t.prototype.processChunk=function(t){this.push(t)},t.prototype.withStreamInfo=function(t,e){return this.extraStreamInfo[t]=e,this.mergeStreamInfo(),this},t.prototype.mergeStreamInfo=function(){for(var t in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,t)&&(this.streamInfo[t]=this.extraStreamInfo[t])},t.prototype.lock=function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},t.prototype.toString=function(){var t="Worker "+this.name;return this.previous?this.previous+" -> "+t:t},t}(),C=function(t){function r(e){var r=t.call(this,"DataWorker")||this;return r.dataIsReady=!1,r.index=0,r.max=0,r.data=null,r.type="",r._tickScheduled=!1,e.then((function(t){r.dataIsReady=!0,r.data=t,r.max=t&&t.length||0,r.type=y(t),r.isPaused||r._tickAndRepeat()}),(function(t){r.error(t)})),r}return e(r,t),r.prototype.cleanUp=function(){A.prototype.cleanUp.call(this),this.data=null},r.prototype.resume=function(){return!!A.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,x(this._tickAndRepeat,[],this)),!0)},r.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(x(this._tickAndRepeat,[],this),this._tickScheduled=!0))},r.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var t=null,e=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":t=this.data.substring(this.index,e);break;case"uint8array":t=this.data.subarray(this.index,e);break;case"array":case"nodebuffer":t=this.data.slice(this.index,e)}return this.index=e,this.push({data:t,meta:{percent:this.max?this.index/this.max*100:0}})},r}(A),I=function(t){function r(e){var r=t.call(this,"DataLengthProbe for "+e)||this;return r.propName=e,r.withStreamInfo(e,0),r}return e(r,t),r.prototype.processChunk=function(t){if(t){var e=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=e+t.data.length}A.prototype.processChunk.call(this,t)},r}(A);var F=function(){for(var t=[],e=0;e<256;e++){for(var r=e,n=0;n<8;n++)r=1&r?3988292384^r>>>1:r>>>1;t[e]=r}return t}();function P(t,e){return void 0===e&&(e=0),void 0!==t&&t.length?"string"!==y(t)?function(t,e,r,n){var o=F,i=n+r;t^=-1;for(var s=n;s<i;s++)t=t>>>8^o[255&(t^e[s])];return-1^t}(0|e,t,t.length,0):function(t,e,r,n){var o=F,i=n+r;t^=-1;for(var s=n;s<i;s++)t=t>>>8^o[255&(t^e.charCodeAt(s))];return-1^t}(0|e,t,t.length,0):0}var E=function(t){function r(){var e=t.call(this,"Crc32Probe")||this;return e.withStreamInfo("crc32",0),e}return e(r,t),r.prototype.processChunk=function(t){this.streamInfo.crc32=P(t.data,this.streamInfo.crc32||0),this.push(t)},r}(A),O=function(){function t(){}return t.createWorkerFrom=function(t,e,r){return t.pipe(new E).pipe(new I("uncompressedSize")).pipe(e.compressWorker(r)).pipe(new I("compressedSize")).withStreamInfo("compression",e)},t}(),T=function(){function t(t,e,r){this.name=t,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this.data=e,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}return t.prototype._compressWorker=function(t,e){var r=new C(this.data);return O.createWorkerFrom(r,t,e)},t}(),R=function(t){function r(e){var r=t.call(this,"ConvertWorker to "+e)||this;return r.destType=e,r}return e(r,t),r.prototype.processChunk=function(t){this.push({data:w(this.destType,t.data),meta:t.meta})},r}(A);function U(t){return e=w("arraybuffer",t),p("blob"),new Blob([e],{type:"application/zip"});var e}var D=function(){function t(t){try{p("uint8array"),this.worker=t.pipe(new R("uint8array")),t.lock()}catch(t){this.worker=new A("error"),this.worker.error(t)}}return t.prototype.accumulate=function(){var t=this;return new Promise((function(e,r){var n=[];t.on("data",(function(t){n.push(t)})).on("error",(function(t){n=[],r(t)})).on("end",(function(){try{var t=U(function(t){for(var e=0,r=0,n=0;n<t.length;n++)r+=t[n].length;var o=new Uint8Array(r);for(n=0;n<t.length;n++)o.set(t[n],e),e+=t[n].length;return o}(n));e(t)}catch(t){r(t)}n=[]})).resume()}))},t.prototype.on=function(t,e){var r=this;return"data"===t?this.worker.on(t,(function(t){e.call(r,t.data,t.meta)})):this.worker.on(t,(function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];x(e,t,r)})),this},t.prototype.resume=function(){return x(this.worker.resume,[],this.worker),this},t.prototype.pause=function(){return this.worker.pause(),this},t}(),B={magic:"\0\0",compressWorker:function(){return new A("STORE compression")},uncompressWorker:function(){return new A("STORE decompression")}},z=Object.freeze({__proto__:null,STORE:B}),j="PK",L="PK",W="PK",N="PK\b";function M(t,e){var r,n="";for(r=0;r<e;r++)n+=String.fromCharCode(255&t),t>>>=8;return n}function H(t,e,r,n,o,i){var s,a,u=t.file,l=t.compression,c=i!==S,h=w("string",i(u.name)),f=w("string",S(u.name)),p=u.comment,d=w("string",i(p)),m=w("string",S(p)),y=f.length!==u.name.length,g=m.length!==p.length,v="",b="",x="",_=u.dir,k=u.date,A={crc32:0,compressedSize:0,uncompressedSize:0};e&&!r||(A.crc32=t.crc32,A.compressedSize=t.compressedSize,A.uncompressedSize=t.uncompressedSize);var C=0;e&&(C|=8),c||!y&&!g||(C|=2048);var I,F,E,O=0,T=0;_&&(O|=16),"UNIX"===o?(T=798,O|=(I=u.unixPermissions,F=_,E=I,I||(E=F?16893:33204),(65535&E)<<16)):(T=20,O|=63&(u.dosPermissions||0)),s=k.getUTCHours(),s<<=6,s|=k.getUTCMinutes(),s<<=5,s|=k.getUTCSeconds()/2,a=k.getUTCFullYear()-1980,a<<=4,a|=k.getUTCMonth()+1,a<<=5,a|=k.getUTCDate(),y&&(b=M(1,1)+M(P(h),4)+f,v+="up"+M(b.length,2)+b),g&&(x=M(1,1)+M(P(d),4)+m,v+="uc"+M(x.length,2)+x);var R="";return R+="\n\0",R+=M(C,2),R+=l.magic,R+=M(s,2),R+=M(a,2),R+=M(A.crc32,4),R+=M(A.compressedSize,4),R+=M(A.uncompressedSize,4),R+=M(h.length,2),R+=M(v.length,2),{fileRecord:j+R+h+v,dirRecord:L+M(T,2)+R+M(d.length,2)+"\0\0\0\0"+M(O,4)+M(n,4)+h+v+d}}function V(t){return N+M(t.crc32,4)+M(t.compressedSize,4)+M(t.uncompressedSize,4)}var K=function(t){function r(e,r,n){var o=t.call(this,"ZipFileWorker")||this;return o.bytesWritten=0,o.zipPlatform=r,o.encodeFileName=n,o.streamFiles=e,o.accumulate=!1,o.contentBuffer=[],o.dirRecords=[],o.currentSourceOffset=0,o.entriesCount=0,o.currentFile=null,o._sources=[],o}return e(r,t),r.prototype.push=function(t){var e=t.meta.percent||0,r=this.entriesCount,n=this._sources.length;this.accumulate?this.contentBuffer.push(t):(this.bytesWritten+=t.data.length,A.prototype.push.call(this,{data:t.data,meta:{currentFile:this.currentFile,percent:r?(e+100*(r-n-1))/r:100}}))},r.prototype.openedSource=function(t){this.currentSourceOffset=this.bytesWritten,this.currentFile=t.file.name;var e=this.streamFiles&&!t.file.dir;if(e){var r=H(t,e,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},r.prototype.closedSource=function(t){this.accumulate=!1;var e=this.streamFiles&&!t.file.dir,r=H(t,e,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),e)this.push({data:V(t),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},r.prototype.flush=function(){for(var t=this.bytesWritten,e=0;e<this.dirRecords.length;e++)this.push({data:this.dirRecords[e],meta:{percent:100}});var r=this.bytesWritten-t,n=function(t,e,r,n,o){var i=w("string",o(n));return W+"\0\0\0\0"+M(t,2)+M(t,2)+M(e,4)+M(r,4)+M(i.length,2)+i}(this.dirRecords.length,r,t,"",this.encodeFileName);this.push({data:n,meta:{percent:100}})},r.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},r.prototype.registerPrevious=function(t){this._sources.push(t);var e=this;return t.on("data",(function(t){e.processChunk(t)})),t.on("end",(function(){e.closedSource(e.previous.streamInfo),e._sources.length?e.prepareNextSource():e.end()})),t.on("error",(function(t){e.error(t)})),this},r.prototype.resume=function(){return!!A.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},r.prototype.error=function(t){var e=this._sources;if(!A.prototype.error.call(this,t))return!1;for(var r=0;r<e.length;r++)try{e[r].error(t)}catch(t){}return!0},r.prototype.lock=function(){A.prototype.lock.call(this);for(var t=this._sources,e=0;e<t.length;e++)t[e].lock()},r}(A);function X(t,e){var r=new K(e.streamFiles,e.platform,e.encodeFileName),n=0;try{t.forEach((function(t,o){n++;var i=function(t,e){var r=t||e,n=z[r];if(!n)throw new Error(r+" is not a valid compression method !");return n}(o.options.compression,e.compression),s=o.options.compressionOptions||e.compressionOptions||{},a=o.dir,u=o.date;o._compressWorker(i,s).withStreamInfo("file",{name:t,dir:a,date:u,comment:o.comment||"",unixPermissions:o.unixPermissions,dosPermissions:o.dosPermissions}).pipe(r)})),r.entriesCount=n}catch(t){r.error(t)}return r}function q(t){return"/"!==t.slice(-1)?t+"/":t}var Z=function(){function t(){this.files={},this.comment=null,this.root="",this.support=l,this.defaults=k,this.version="3.2.0"}return t.prototype.clone=function(){var e=new t;for(var r in this)"function"!=typeof this[r]&&(e[r]=this[r]);return e},t.prototype.forEach=function(t){for(var e in this.files)if(Object.prototype.hasOwnProperty.call(this.files,e)){var r=this.files[e],n=e.slice(this.root.length,e.length);n&&e.slice(0,this.root.length)===this.root&&t(n,r)}},t.prototype.folderAdd=function(t,e){return void 0===e&&(e=k.createFolders),t=q(t),this.files[t]||this.fileAdd(t,null,{dir:!0,createFolders:e}),this.files[t]},t.prototype.fileAdd=function(t,e,n){var o,i,s,a=r(r({},k),n);a.date=a.date||new Date,null!==a.compression&&(a.compression=a.compression.toUpperCase()),"string"==typeof a.unixPermissions&&(a.unixPermissions=parseInt(a.unixPermissions,8)),a.unixPermissions&&16384&a.unixPermissions&&(a.dir=!0),a.dosPermissions&&16&a.dosPermissions&&(a.dir=!0),a.dir&&(t=q(t)),a.createFolders&&(o=(s=function(t){return"/"===t.slice(-1)?t.substr(0,t.length-1):t}(i=t).lastIndexOf("/"))>0?i.substring(0,s):"")&&this.folderAdd(o,!0),a.binary=a.binary||a.base64,!a.dir&&e&&0!==e.length||(a.base64=!1,a.binary=!0,e="",a.compression="STORE");var u=_(e,a.base64),l=new T(t,u,a);this.files[t]=l},t.prototype.file=function(t,e){return this.fileAdd(this.root+t,e),this},t.prototype.folder=function(t){t=this.root+t;var e=this.folderAdd(t),r=this.clone();return r.root=e.name,r},t.prototype.generateAsync=function(){var t,e={streamFiles:!1,compression:"STORE",compressionOptions:null,type:"blob",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:S};try{p("blob"),t=X(this,e)}catch(e){(t=new A("error")).error(e)}return new D(t).accumulate()},t}(),G="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var Y=function(t,e){return t(e={exports:{}},e.exports),e.exports}((function(t,e){!function(){function e(t,e,r){var n=new XMLHttpRequest;n.open("GET",t),n.responseType="blob",n.onload=function(){i(n.response,e,r)},n.onerror=function(){console.error("could not download file")},n.send()}function r(t){var e=new XMLHttpRequest;e.open("HEAD",t,!1);try{e.send()}catch(t){}return 200<=e.status&&299>=e.status}function n(t){try{t.dispatchEvent(new MouseEvent("click"))}catch(r){var e=document.createEvent("MouseEvents");e.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),t.dispatchEvent(e)}}var o="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof G&&G.global===G?G:void 0,i=o.saveAs||("object"!=typeof window||window!==o?function(){}:"download"in HTMLAnchorElement.prototype?function(t,i,s){var a=o.URL||o.webkitURL,u=document.createElement("a");i=i||t.name||"download",u.download=i,u.rel="noopener","string"==typeof t?(u.href=t,u.origin===location.origin?n(u):r(u.href)?e(t,i,s):n(u,u.target="_blank")):(u.href=a.createObjectURL(t),setTimeout((function(){a.revokeObjectURL(u.href)}),4e4),setTimeout((function(){n(u)}),0))}:"msSaveOrOpenBlob"in navigator?function(t,o,i){if(o=o||t.name||"download","string"!=typeof t)navigator.msSaveOrOpenBlob(function(t,e){return void 0===e?e={autoBom:!1}:"object"!=typeof e&&(console.warn("Deprecated: Expected third argument to be a object"),e={autoBom:!e}),e.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)?new Blob(["\ufeff",t],{type:t.type}):t}(t,i),o);else if(r(t))e(t,o,i);else{var s=document.createElement("a");s.href=t,s.target="_blank",setTimeout((function(){n(s)}))}}:function(t,r,n,i){if((i=i||open("","_blank"))&&(i.document.title=i.document.body.innerText="downloading..."),"string"==typeof t)return e(t,r,n);var s="application/octet-stream"===t.type,a=/constructor/i.test(o.HTMLElement)||o.safari,u=/CriOS\/[\d]+/.test(navigator.userAgent);if((u||s&&a)&&"object"==typeof FileReader){var l=new FileReader;l.onloadend=function(){var t=l.result;t=u?t:t.replace(/^data:[^;]*;/,"data:attachment/file;"),i?i.location.href=t:location=t,i=null},l.readAsDataURL(t)}else{var c=o.URL||o.webkitURL,h=c.createObjectURL(t);i?i.location=h:location.href=h,i=null,setTimeout((function(){c.revokeObjectURL(h)}),4e4)}});o.saveAs=i.saveAs=i,t.exports=i}()})).saveAs;function J(t){return'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+function t(e){if("object"!=typeof e)return e.toString();var r=["<"+e._t];for(var n in e)n.startsWith("_")||void 0===e[n]||r.push(" "+n+'="'+e[n]+'"');if(e._c&&e._c.length>0){r.push(">");for(var o=0,i=e._c;o<i.length;o++){var s=i[o];r.push(t(s))}r.push("</"+e._t+">")}else r.push("/>");return r.join("")}(t)}function Q(t){var e="#"===t[0]?t.substr(1):t;if(3===(e=e.toUpperCase()).length)return"FF"+(e[0]+e[0]+e[1]+e[1]+e[2]+e[2]);if(6===e.length)return"FF"+e;if(8===e.length)return e.substring(6,8)+e.substring(0,6);throw new Error("Invalid color provided: "+t)}var $=function(){function t(t,e,r){this.sheet=t,this.row=e,this.col=r}return t.prototype.set=function(t,e){this.sheet.set(t,r({row:this.row,col:this.col},e))},t.prototype.get=function(){return this.sheet.get({row:this.row,col:this.col})},t}(),tt=function(){function t(t,e,r){this.sheet=t,this.index=e,r.width=r.width||null,this.data=r}return t.prototype.row=function(t){return new $(this.sheet,t,this.index)},t.prototype.width=function(t){if(!t)return this.data.width;this.data.width=t},t}(),et=function(){function t(t,e,r){this.sheet=t,this.index=e,r.height=r.height||null,this.data=r}return t.prototype.col=function(t){return new $(this.sheet,this.index,t)},t.prototype.height=function(t){if(!t)return this.data.height;this.data.height=t},t}(),rt=function(){function t(t){this.config=t}return t.prototype.export=function(){var t=this.config,e=t.fontFamily,r=t.fontSize,n=t.fontWeight,o=t.textDecoration,i=t.fontStyle,s=t.color,a=[];return a.push({_t:"name",val:e}),r&&a.push({_t:"sz",val:r.toString().replace("px","")}),"bold"===n&&a.push({_t:"b"}),o&&a.push({_t:{"line-through":"strike",underline:"u"}[o]}),"italic"===i&&a.push({_t:"i"}),s&&a.push({_t:"color",rgb:Q(s)}),{_t:"font",_c:a}},t}(),nt=function(){function t(t){this.config=t}return t.prototype.export=function(){var t=this.config.backgroundColor;return{_t:"fill",_c:[{_t:"patternFill",patternType:"solid",_c:[{_t:"bgColor",rgb:Q(t)},{_t:"fgColor",rgb:Q(t)}]}]}},t}(),ot=function(){function t(t){this.config=t}return t.prototype.export=function(){var t=this.config,e=t.borderStyle,r=t.borderColor,n=t.borderVerticalStyle,o=t.borderVerticalColor,i=t.borderHorizontalStyle,s=t.borderHorizontalColor,a={style:t.borderTopStyle||n||e,color:t.borderTopColor||o||r},u={style:t.borderBottomStyle||n||e,color:t.borderBottomColor||o||r},l={style:t.borderStartStyle||i||e,color:t.borderStartColor||s||r},c={style:t.borderEndStyle||i||e,color:t.borderEndColor||s||r};return{_t:"border",_c:[{_t:"top",style:a.style,_c:a.color&&[{_t:"color",rgb:Q(a.color)}]},{_t:"bottom",style:u.style,_c:u.color&&[{_t:"color",rgb:Q(u.color)}]},{_t:"start",style:l.style,_c:l.color&&[{_t:"color",rgb:Q(l.color)}]},{_t:"end",style:c.style,_c:c.color&&[{_t:"color",rgb:Q(c.color)}]}]}},t}(),it=function(){function t(t,e,r){this.alignment=null,this.index=e,(t.fontFamily||t.fontSize||t.fontWeight||t.textDecoration||t.fontStyle||t.color)&&(t.fontFamily=t.fontFamily||"Arial",this.fontIndex=r.fonts.length,r.fonts.push(new rt(t))),t.backgroundColor&&(this.fillIndex=r.fills.length,r.fills.push(new nt(t))),(t.borderStyle||t.borderColor||t.borderVerticalStyle||t.borderVerticalColor||t.borderHorizontalStyle||t.borderHorizontalColor||t.borderTopStyle||t.borderTopColor||t.borderBottomStyle||t.borderBottomColor||t.borderStartStyle||t.borderStartColor||t.borderEndStyle||t.borderEndColor)&&(this.borderIndex=r.borders.length,r.borders.push(new ot(t))),(t.textAlign||t.verticalAlign)&&(this.alignment={textAlign:t.textAlign,verticalAlign:t.verticalAlign})}return t.prototype.export=function(){return{_t:"xf",fontId:this.fontIndex,applyFont:"number"==typeof this.fontIndex?"true":void 0,fillId:this.fillIndex,applyFill:"number"==typeof this.fillIndex?"true":void 0,borderId:this.borderIndex,applyBorder:"number"==typeof this.borderIndex?"true":void 0,applyAlignment:this.alignment?"true":void 0,_c:[this.alignment&&{_t:"alignment",horizontal:this.alignment.textAlign,vertical:"middle"===this.alignment.verticalAlign?"center":this.alignment.verticalAlign}].filter(Boolean)}},t}();function st(t){for(var e="";t>0;){var r=(t-1)%26;e=String.fromCharCode(65+r)+e,t=(t-r)/26|0}return e}var at=function(){function t(t,e){this.data={},this.rowsData={},this.colsData={},this.styles={rtl:!1},this.filters=[],this.book=t,this.name=e}return t.prototype.col=function(t){return this.colsData[t]=this.colsData[t]||{},new tt(this,t,this.colsData[t])},t.prototype.row=function(t){return this.rowsData[t]=this.rowsData[t]||{},new et(this,t,this.rowsData[t])},t.prototype.cell=function(t,e){return new $(this,t,e)},t.prototype.set=function(t,e){var r=e.type,n=e.row,o=e.col,i=e.style;if(!r)if("string"==typeof t)r="string";else{if("number"!=typeof t)throw new Error("Invalid cell value type. Only numbers and strings are allowed.");r="number"}this.data[n]||(this.data[n]={}),this.data[n][o]||(this.data[n][o]={});var s=this.data[n][o];if(i&&(s.s=i instanceof it?i.index:this.book.style(i).index),"string"===r)s.t="inlineStr";else{if("number"!==r)throw new Error("Invalid cell type provided: "+r);s.t="n"}s.v=t},t.prototype.get=function(t){var e=t.row,r=t.col;return this.data[e]&&this.data[e][r]?this.data[e][r].v:null},t.prototype.style=function(t){this.styles=r(r({},this.styles),t)},t.prototype.addFilter=function(t){this.filters.push(st(t.from.col)+t.from.row+":"+st(t.to.col)+t.to.row)},t.prototype.export=function(){return J({_t:"worksheet",xmlns:"http://schemas.openxmlformats.org/spreadsheetml/2006/main","xmlns:r":"http://schemas.openxmlformats.org/officeDocument/2006/relationships",_c:n([this.exportStyles(),this.exportColumns(),this.exportData()],this.exportFilters()).filter(Boolean)})},t.prototype.exportStyles=function(){return{_t:"sheetViews",_c:[{_t:"sheetView",rightToLeft:this.styles.rtl?"true":"false",workbookViewId:"0"}]}},t.prototype.exportData=function(){var t=[];for(var e in this.data){var r=[];for(var n in this.data[e]){var o=this.data[e][n],i=[];"inlineStr"===o.t?i.push({_t:"is",_c:[{_t:"t",_c:[o.v]}]}):i.push({_t:"v",_c:[o.v]}),r.push({_t:"c",t:o.t,s:o.s,r:st(n)+e,_c:i})}var s=this.rowsData[e]||{};t.push({_t:"row",customHeight:"number"==typeof s.height?"true":"false",ht:"number"==typeof s.height?s.height:void 0,r:e,_c:r})}return{_t:"sheetData",_c:t}},t.prototype.exportFilters=function(){return this.filters.map((function(t){return{_t:"autoFilter",ref:t}}))},t.prototype.exportColumns=function(){var t=this;return Object.keys(this.colsData).length?{_t:"cols",_c:Object.keys(this.colsData).map((function(e){return{_t:"col",min:e,max:e,customWidth:"number"==typeof t.colsData[e].width?"true":"false",width:"number"==typeof t.colsData[e].width?t.colsData[e].width:void 0}}))}:null},t}(),ut=function(){function t(){this.sheets=[],this.styles=[],this.styleElements={fonts:[],fills:[],borders:[]},this.style({fontFamily:"Arial"})}return t.prototype.sheet=function(t){var e=new at(this,t);return this.sheets.push(e),e},t.prototype.style=function(t){var e=new it(t,this.styles.length,this.styleElements);return this.styles.push(e),e},t.prototype.save=function(t){var e=new Z,r=e.folder("_rels"),o=e.folder("xl"),i=o.folder("_rels"),s=o.folder("worksheets");e.file("[Content_Types].xml",J({_t:"Types",xmlns:"http://schemas.openxmlformats.org/package/2006/content-types",_c:n([{_t:"Default",Extension:"rels",ContentType:"application/vnd.openxmlformats-package.relationships+xml"},{_t:"Override",PartName:"/xl/workbook.xml",ContentType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"},{_t:"Override",PartName:"/xl/styles.xml",ContentType:"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"}],this.sheets.map((function(t,e){return{_t:"Override",PartName:"/xl/worksheets/sheet"+(e+1)+".xml",ContentType:"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"}})))})),r.file(".rels",J({_t:"Relationships",xmlns:"http://schemas.openxmlformats.org/package/2006/relationships",_c:[{_t:"Relationship",Id:"rId1",Type:"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",Target:"xl/workbook.xml"}]})),o.file("workbook.xml",J({_t:"workbook",xmlns:"http://schemas.openxmlformats.org/spreadsheetml/2006/main","xmlns:r":"http://schemas.openxmlformats.org/officeDocument/2006/relationships",_c:[{_t:"sheets",_c:this.sheets.map((function(t,e){return{_t:"sheet",name:t.name,sheetId:(e+1).toString(),"r:id":"rId"+(e+2)}}))}]})),i.file("workbook.xml.rels",J({_t:"Relationships",xmlns:"http://schemas.openxmlformats.org/package/2006/relationships",_c:n([{_t:"Relationship",Id:"rId1",Type:"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",Target:"styles.xml"}],this.sheets.map((function(t,e){return{_t:"Relationship",Id:"rId"+(e+2),Type:"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",Target:"worksheets/sheet"+(e+1)+".xml"}})))}));for(var a=0;a<this.sheets.length;a++)s.file("sheet"+(a+1)+".xml",this.sheets[a].export());o.file("styles.xml",J({_t:"styleSheet",xmlns:"http://schemas.openxmlformats.org/spreadsheetml/2006/main","xmlns:x14ac":"http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac","xmlns:mc":"http://schemas.openxmlformats.org/markup-compatibility/2006",_c:[{_t:"fonts",count:this.styleElements.fonts.length,_c:this.styleElements.fonts.map((function(t){return t.export()}))},{_t:"fills",count:this.styleElements.fills.length,_c:this.styleElements.fills.map((function(t){return t.export()}))},{_t:"borders",count:this.styleElements.borders.length,_c:this.styleElements.borders.map((function(t){return t.export()}))},{_t:"cellXfs",count:this.styles.length,_c:this.styles.map((function(t){return t.export()}))}]})),e.generateAsync().then((function(e){Y(e,t)}))},t}();module.exports=ut;

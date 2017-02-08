'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.FrameMiddleware=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if('value'in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();var _Interface=require('../Interface');var _Address=require('../../Address');var _constants=require('../../../constants');var _common=require('../../../proxies/common');function _toConsumableArray(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++){arr2[i]=arr[i]}return arr2}else{return Array.from(arr)}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')}return call&&(typeof call==='object'||typeof call==='function')?call:self}function _inherits(subClass,superClass){if(typeof superClass!=='function'&&superClass!==null){throw new TypeError('Super expression must either be null or a function, not '+typeof superClass)}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass}/* eslint-disable no-undef */var Logger=require('../../../utils/logger')(__filename);// +------+----------+----------+----------+
// | ATYP | DST.ADDR | DST.PORT |   DATA   |
// +------+----------+----------+----------+
// |  1   | Variable |    2     | Variable |
// +------+----------+----------+----------+
var FrameMiddleware=exports.FrameMiddleware=function(_IMiddleware){_inherits(FrameMiddleware,_IMiddleware);function FrameMiddleware(props){_classCallCheck(this,FrameMiddleware);var _this=_possibleConstructorReturn(this,(FrameMiddleware.__proto__||Object.getPrototypeOf(FrameMiddleware)).call(this,props));_this._target_address=null;_this._direction=null;_this._onNotify=null;_this._is_connected=false;_this._target_address=props.address;_this._direction=props.direction;return _this}_createClass(FrameMiddleware,[{key:'subscribe',value:function subscribe(notifier){this._onNotify=notifier}},{key:'write',value:function write(buffer){var _this2=this;return new Promise(function(next){var direction=_this2._direction;if(direction===_Interface.MIDDLEWARE_DIRECTION_UPWARD){if(__IS_SERVER__){next(_this2.pack(new _Address.Address,buffer))}else{next(_this2.pack(_this2._target_address,buffer))}}if(direction===_Interface.MIDDLEWARE_DIRECTION_DOWNWARD){(function(){var frame=_this2.unpack(buffer);if(frame===null&&Logger.isWarnEnabled()){throw Error('-x-> dropped unidentified packet '+buffer.length+' bytes @FrameMiddleware')}if(__IS_SERVER__&&!_this2._is_connected){// connect to the real server
var addr=new _Address.Address({ATYP:frame.ATYP,DSTADDR:frame.DSTADDR,DSTPORT:frame.DSTPORT});var onConnected=function onConnected(){next(frame.DATA);_this2._is_connected=true};_this2._onNotify({type:_constants.SOCKET_CONNECT_TO_DST,payload:[addr,onConnected]})}else{next(frame.DATA)}})()}})}},{key:'pack',value:function pack(address,data){var ATYP=address.ATYP,DSTADDR=address.DSTADDR,DSTPORT=address.DSTPORT;var addr=null;if(ATYP===_common.ATYP_DOMAIN){addr=[DSTADDR.length].concat(_toConsumableArray(DSTADDR))}else{addr=DSTADDR}return Buffer.from([ATYP].concat(_toConsumableArray(addr),_toConsumableArray(DSTPORT),_toConsumableArray(data)))}},{key:'unpack',value:function unpack(buffer){var _buffer=Buffer.from(buffer);if(_buffer.length<7){Logger.debug('invalid length: '+_buffer.length);return null}var DSTADDR=null;var DSTPORT=null;switch(_buffer[0]){case _common.ATYP_V4:{DSTADDR=_buffer.slice(1,5);DSTPORT=_buffer.slice(5,7);break}// case ATYP_V6: {
//   if (_buffer.length < 21) {
//     Logger.debug(`invalid length: ${_buffer.length}`);
//     return null;
//   }
//   DSTADDR = _buffer.slice(2, 19);
//   DSTPORT = _buffer.slice(19, 21);
//   break;
// }
case _common.ATYP_DOMAIN:{var domainLen=_buffer[1];if(_buffer.length<4+domainLen){Logger.debug('invalid length: '+_buffer.length);return null}DSTADDR=_buffer.slice(2,2+domainLen);DSTPORT=_buffer.slice(2+domainLen,4+domainLen);break}default:Logger.debug('unknown ATYP: '+_buffer[0]);return null;}return{ATYP:_buffer[0],DSTADDR:DSTADDR,DSTPORT:DSTPORT,DATA:_buffer.slice(DSTADDR.length+(_buffer[0]===_common.ATYP_DOMAIN?4:3)),toBuffer:function toBuffer(){return Buffer.from([this.ATYP].concat(_toConsumableArray(this.DSTADDR),_toConsumableArray(this.DSTPORT),_toConsumableArray(this.DATA)))}}}}]);return FrameMiddleware}(_Interface.IMiddleware);
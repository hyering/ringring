/* define Parameters **************************************************/
const DEVICE_NAME_PREFIX = 'BBC micro:bit'
const TEMPERATURE_SERVICE_UUID = 'e95d6100-251d-470a-a062-fa1922dfa9a8'
const TEMPERATURE_PERIOD_UUID = 'e95d1b25-251d-470a-a062-fa1922dfa9a8'
const TEMPERATURE_DATA_UUID = 'e95d9250-251d-470a-a062-fa1922dfa9a8'
// Messages
const MSG_CONNECTED = 'Connected'
const MSG_CONNECT_ERROR = 'Failed to connect'
const MSG_DISCONNECTED = 'Disconneted'
/**********************************************************************/
// request connect  UUID
const SERVICE_UUID = TEMPERATURE_SERVICE_UUID
const CHARACTERISTIC_UUID_1 = TEMPERATURE_PERIOD_UUID
const CHARACTERISTIC_UUID_2 = TEMPERATURE_DATA_UUID
// read interval timer mS
const INTERVAL = 500
// connected device value
var connectDevice = 0x2A24

// disconnect process
function disconnect () {
  if (!connectDevice || !connectDevice.gatt.connected) return
  connectDevice.gatt.disconnect()
  alert(MSG_DISCONNECTED)
  postDisconnect()
}

// post disconnect process is here
function postDisconnect () {
  document.js.temperature.value = ''
}

// connect process
function connect () {
  navigator.bluetooth.requestDevice({
    filters: [{
      namePrefix: DEVICE_NAME_PREFIX
    }],
    optionalServices: [SERVICE_UUID]
  })
    .then(device => {
      connectDevice = device
      console.log('device', device)
      return device.gatt.connect()
    })
    .then(server => {
      console.log('server', server)
      server.getPrimaryService(SERVICE_UUID)
        .then(service => {
          // start service is here
          setPeriod(service, CHARACTERISTIC_UUID_1) // set interval timer
          startService(service, CHARACTERISTIC_UUID_2) // start temperature event
        })
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

// set interval timer
function setPeriod (service, charUUID) {
  service.getCharacteristic(charUUID)
    .then(characteristic => {
      characteristic.writeValue(new Uint16Array([INTERVAL]))
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

// start service event
function startService (service, charUUID) {
  service.getCharacteristic(charUUID)
    .then(characteristic => {
      characteristic.startNotifications()
        .then(char => {
          alert(MSG_CONNECTED)
          characteristic.addEventListener('characteristicvaluechanged',
            // event is here
            onTemperatureChanged)
          console.log('Temperature:', char)
        })
    })
    .catch(error => {
      console.log(error)
      alert(MSG_CONNECT_ERROR)
    })
}

// event handler
function onTemperatureChanged (event) {
  let temperature = event.target.value.getUint8(0, true)
  // updateBearingValue(bearing)
  console.log('Temperature:' + temperature)
  document.js.temperature.value = temperature
}

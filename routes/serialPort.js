const { SerialPort, ReadlineParser } = require("serialport");

const serialPort = new SerialPort({
  path: "COM3", 
  baudRate: 9600,
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

module.exports = { serialPort, parser };

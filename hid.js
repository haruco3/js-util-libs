/* Simple WebHID device wrapper */

/* constructor arguments:
/*	- Vendor ID: number
/*	- Product ID: number
/*	- Buffer Length: number (optional) - length in bytes of read/write message. Defaults to 64

/* Static properties:
/*	- available: bool - whether WebHID is supported in the current browser and context

/* Methods:
/*	- connect(): void (async) - attempts to connect to the device
/*	- disconnect(): void - closes the connection to the device
/*	- readData(): DataView - returns the last message read from the device, or null if the device is unavailable
/*	- writeData(data: DataView, bWriteCommand: boolean): void - writes a message to the device
/*		arguments:
/*		 - data: The message to write to the device, in a DataView
/*		 - bWriteCommand: Set this to false if the message is just a request to recieve data; set to true if you are writing data to the device

/* Event handlers:
/*	- ondisconnect: Called when the device is disconnected
/*	- onreadcomplete: Called when a message is recieved from the device. Provides the message's content in a DataView as the first argument
/*	- ondevicemenuopen: Called when the browser's device selection menu is opened
/*	- ondevicemenuopen: Called when the browser's device selection menu is closed, whether due to a cancel or selection action
*/

var HIDDevice;

(function() {
    HIDDevice = function(nVendorId, nProductId, nBufferLength = 64) {
        if (!HIDDevice.available)
            throw "HID Communication not supported in this browser";

        this.vendorId = nVendorId;
        this.productId = nProductId;
        this.connected = false;
        this.channelOpen = false;
        this.buffer = new DataView(new ArrayBuffer(nBufferLength));
        this.device = null;
        navigator.hid.ondisconnect = hidDeviceDisconnected.bind(this);

        this.lock = false;
        this.readBuffer = null;
        this.writeBuffer = null;
    }

	// Test if WebHID is supported in the browser and current context
    HIDDevice.available = "hid" in navigator && window.isSecureContext;

    function getDeviceInputReport(oEvent) {
        this.buffer = oEvent.data;
        console.log(this.buffer.buffer);
        if (this.onreadcomplete) // Dispatch read complete event with the DataView buffer as an argument
            this.onreadcomplete(this.buffer);
        if (this.writeBuffer) { // If there is another write command waiting then execute it
            this.device.sendReport(0, this.writeBuffer);
            this.writeBuffer = null;
        }
        else if (this.readBuffer) { // Otherwise, if there is a read command waiting, execute it
            this.device.sendReport(0, this.readBuffer);
            this.readBuffer = null;
        } else // Otherwise no more commands, remove lock
            this.lock = false;
    }
    function hidDeviceDisconnected(oEvent) {
        if (oEvent.device.productId === this.device.productId) { // If the disconnected device matches this one
            this.channelOpen = this.connected = false;
            this.device = null;
            if (this.ondisconnect) // Dispatch disconnect event
                this.ondisconnect();
        }
    }

    HIDDevice.prototype.connect = async function() {
        if (!this.channelOpen) {
            if (!this.device) {
                // First check if device has already been paired
                const pairedDevices = await navigator.hid.getDevices();
                for (var i = 0; i < pairedDevices.length; i++) {
                    var device = pairedDevices[i];
                    if (device.productId == this.productId && device.vendorId == this.vendorId) {
                        this.device = device;
                        break;
                    }
                };
                // If not then open dialog box to select device
                if (!this.device) {
                    if (this.ondevicemenuopen)
                        this.ondevicemenuopen();
                    const filters = [{ vendorId: this.vendorId, productId: this.productId }],
                        [device] = await navigator.hid.requestDevice({ filters });
                    if (this.ondevicemenuclose)
                        this.ondevicemenuclose();
                    if (!device)
                        return false;
                    this.device = device;
                }

                this.connected = true;
                this.device.oninputreport = getDeviceInputReport.bind(this);
            }
            await this.device.open();
            this.channelOpen = true;
        }
        return true;
    }
    HIDDevice.prototype.disconnect = function() {
        if (this.channelOpen)
            this.device.close();
    }
    HIDDevice.prototype.readData = function() {
        return this.connected ? this.buffer : null;
    }
    HIDDevice.prototype.writeData = function(data, bWriteCommand) {
        if (this.channelOpen) {
            if (!this.lock) {
                this.lock = true;
                this.device.sendReport(0, data);
                console.log(data.buffer);
            } else {
                if (bWriteCommand)
                    this.writeBuffer = new DataView(data.buffer.slice(0));
                else
                    this.readBuffer = new DataView(data.buffer.slice(0));
            }
        }
    }
}())
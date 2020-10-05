// required modules
const Pool = require("multiprocessing").Pool;

// classes
class BindableEvent {
    constructor() {
        // properties
        this.ClassName = "BindableEvent";
        this.Name = "BindableEvent";
        this.Archivable = true;

        // hidden properties (shouldn't be used)
        this._connections = {};
        this._waits = {};

        // functions
        this.NewConnection = function (func, label) {
            let isThere = false;
            for (let i = 1; i < this._connections; i++) {
                if (this._connections[i].name == label) {
                    isThere = true;
                    break;
                }
            }
            if (!isThere) {
                this._connections.push({ function: func, name: label })
            } else {
                Error("There is already a connection to the bindable event '" + this.Name + "' that is named '" + label + "'. Please use a different name for the connection.")
                return;
            }
        }

        this.Disconnect = function (label) {
            for (let i = 1; i < this._connections; i++) {
                if (this._connections[i].name == label) {
                    this._connections.splice(i, 1)
                    break;
                }
            }
        }

        this.Wait = function (func) {
            this._waits.push({ function: func })
        }

        this.Fire = function (...args) {
            for (let i = 1; i < this._connections; i++) {
                this._connections[i].function(...args)
            }
            for (let i = 1; i < this._waits; i++) {
                this._waits[i].function(...args)
                this._waits.splice(i, 1);
            }
        }
    }
}

// service creations
class Renderer {
    constructor() {
        // properties
        this.ClassName = "Service";
        this.Name = "Renderer";
        this.Archivable = false;

        // events
        this.FrameUpdate = new BindableEvent();
    }
}

// service recognize
let services = {
    "Renderer": new Renderer()
}

// service controllers

//--// renderer controller \\--\\

let renderer = services.Renderer;
let last = new Date()

const pool = new Pool(1);

pool.map([1, 2, 3, 4, 5], function () {
    while (true) {
        setTimeout(function () {
            let current = new Date()
            renderer.FrameUpdate.Fire(current - last)
        }, (1000 / 60))
    }
})

// GetService function

exports.GetService = function (service) {
    if (typeof service != "string") {
        Error("The service specified is not of type 'string'. Please make sure you are using the name of the service.")
        return
    }
    if (services[service]) {
        return services[service]();
    } else {
        Error("There is no service with the name '" + service + "'. Please make sure you entered the name correctly, and you are using the latest version of Electron Engine.")
        return
    }
}
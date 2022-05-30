class WebEngine
{
    constructor()
    {
        this.socket = null;
        this.conOpenCallbacks = [];
        this.messageCallbacks = [];
    }
    isConnected()
    {
        if (this.socket != null )
            return this.socket.readyState < 2;
        return false;

    }
    establishConnection(playerName)
    {
        this.playerName = playerName;
        if (this.socket != null)
            this.socket.close(); 
        this.socket = this.createSocket();
    }
    addConnectCallback(cb)
    {
        this.conOpenCallbacks.push(cb);
    }
    addMessageCallback(cb)
    {
        this.messageCallbacks.push(cb);
    }
    delConnectCallback(cb)
    {
        this.conOpenCallbacks = this.conOpenCallbacks.filter(item => item !== cb)
    }
    delMessageCallback(cb)
    {
        this.messageCallbacks = this.messageCallbacks.filter(item => item !== cb)
    }
    closeConnection()
    {
        console.log("Socket obj: ", this.socket);
        if (this.socket != null)
        {
            console.log("Engine closing connection");
            this.socket.close(); 
        }
    }
    createSocket()
    {
        let socket = new WebSocket(`ws://fit-webtech-chess.herokuapp.com/chess?name=${this.playerName}`);
        var self = this;
        
        socket.addEventListener('open', function (event) {
            //console.log("Con opened");
            self.conOpenCallbacks.forEach((cb) => { cb(event) });
            //console.log(event);
        });
        
        socket.addEventListener('error', function (event) {
            console.log('Error: ', event);
        });
        
        socket.addEventListener('close', function (event) {
            self.socket = self.createSocket();
            console.log(event);
        });
        
        socket.addEventListener('message', function (event) {
            self.messageCallbacks.forEach((cb) => { cb(event) });
            //console.log('Message from server ', event.data);
        });

        
    }
}

const EngineInstance = new WebEngine();
//Object.freeze(EngineInstance);

export default EngineInstance

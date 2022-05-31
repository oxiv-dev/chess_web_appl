class WebEngine
{
    constructor()
    {
        this.isConOpened = false; 
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
        this.isConOpened = true;
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
        if (this.socket != null)
        {
            this.socket.close(); 
        }
        this.isConOpened = false;
    }
    getStateFromServer()
    {
        if (this.socket.readyState === this.socket.OPEN)
            this.socket.send('state'); 
    }
    createSocket()
    {

        let socket = new WebSocket(`ws://fit-webtech-chess.herokuapp.com/chess?name=${this.playerName}`);
        
        var self = this;
        
        socket.addEventListener('open', function (event) {
            self.conOpenCallbacks.forEach((cb) => { cb(event) });
        });
        
        socket.addEventListener('error', function (event) {
            console.log('Error: ', event);
        });
        
        socket.addEventListener('close', function (event) {
            console.log('Close event');
            console.log(event);
            if (this.isConOpened)
                self.socket = self.createSocket();
        });
        
        socket.addEventListener('message', function (event) {
            self.messageCallbacks.forEach((cb) => { cb(event) });
        });

        return socket;
    }
}

const EngineInstance = new WebEngine();
//Object.freeze(EngineInstance);

export default EngineInstance

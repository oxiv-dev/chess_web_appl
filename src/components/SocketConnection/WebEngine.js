const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function tryParseJson(str) {
    try {
        const data = JSON.parse(str);
        return data;
    } catch (e) {
        return null;
    }
}
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
    async sendMessageSafe(mes)
    {
        if (this.socket == null)
            return
        
        while(this.socket.readyState === this.socket.CONNECTING)
                await sleep(100);

        if (this.socket.readyState === this.socket.CLOSING || this.socket.readyState === this.socket.CLOSED)
            return;
        
        this.socket.send(mes);
    }
    stopGameForPlayer() {
        this.sendMessageSafe('quit');
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
        this.sendMessageSafe('state'); 
    }
    createSocket()
    {

        let socket = new WebSocket(`wss://fit-webtech-chess.herokuapp.com/chess?name=${this.playerName}`);
        
        var self = this;
        
        socket.addEventListener('open', function (event) {
            self.conOpenCallbacks.forEach((cb) => { cb(event) });
        });
        
        socket.addEventListener('error', function (event) {
        });
        
        socket.addEventListener('close', function (event) {
            if (this.isConOpened)
                self.socket = self.createSocket();
        });
        
        socket.addEventListener('message', function (event) {
            self.messageCallbacks.forEach((cb) => { cb(event) });
        });

        return socket;
    }
    async requestPossibleSquaresForPiece(coord)
    {
        await this.sendMessageSafe(JSON.stringify(coord));
        
    }
}

const EngineInstance = new WebEngine();
//Object.freeze(EngineInstance);

export { EngineInstance, tryParseJson};

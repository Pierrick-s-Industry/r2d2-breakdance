const App = () => {
    const [ws, setWs] = React.useState(null);
    const [clientStatus, setClientStatus] = React.useState(false);
    const [machineStatus, setMachineStatus] = React.useState(false);

    async function connect(retries = 0) {
        const {isProduction} = await fetch('/api/env').then(res => res.json());
        const socket = new WebSocket(`ws${isProduction ? 's' : ''}://${window.location.host}`);
        setWs(socket);


        socket.onopen = () => {
            socket.send('client:ping-request');
            setClientStatus(true);
        };

        socket.onmessage = (event) => {
            const msg = event.data;
            if (msg.startsWith('client:')) return;
            console.log('Message from server:', msg);

            if (msg === 'iot:ping-response') {
                setMachineStatus(true);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
            setClientStatus(false);
            if (retries > 10) return;
            setTimeout(() => {
                console.log('Reconnecting...');
                connect(retries + 1);
            }, 1000);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setClientStatus(false);
        };

        return () => {
            socket.close();
        };
    }

    React.useEffect(() => {connect()}, []);
    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col items-center">
                <div className="flex items-center mb-4">
                    <span className={`mr-2 ${clientStatus ? 'text-green-500' : 'text-red-500'}`}>
                        <i className={`fas ${clientStatus ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    </span>
                    <span>Client Status: {clientStatus ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div className="flex items-center">
                    <span className={`mr-2 ${machineStatus ? 'text-green-500' : 'text-red-500'}`}>
                        <i className={`fas ${machineStatus ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    </span>
                    <span>Machine Status: {machineStatus ? 'Connected' : 'Disconnected'}</span>
                </div>
            </div>
            <div className="flex space-x-4 mt-4">
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onMouseDown={() => ws && ws.send('client:forward')}
                    onMouseUp={() => ws && ws.send('client:stop')}
                >
                    <i className="fas fa-arrow-up mr-2"></i>Avancer
                </button>
                <button 
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    onMouseDown={() => ws && ws.send('client:backward')}
                    onMouseUp={() => ws && ws.send('client:stop')}
                >
                    <i className="fas fa-arrow-down mr-2"></i>Reculer
                </button>
                <button 
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    onMouseDown={() => ws && ws.send('client:left')}
                    onMouseUp={() => ws && ws.send('client:stop')}
                >
                    <i className="fas fa-rotate-left mr-2"></i>Left
                </button>
                <button 
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    onMouseDown={() => ws && ws.send('client:right')}
                    onMouseUp={() => ws && ws.send('client:stop')}
                >
                    <i className="fas fa-rotate-right mr-2"></i>Right
                </button>
            </div>
            <div className="flex flex-col items-center mt-4">
                <input 
                    type="text" 
                    className="border rounded px-4 py-2 mb-2 w-full" 
                    placeholder="Enter custom command"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && ws) {
                            ws.send(`client:${e.target.value}`);
                            e.target.value = '';
                        }
                    }}
                />
                <button 
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={(e) => {
                        const input = e.target.previousSibling;
                        if (ws && input.value) {
                            ws.send(`client:${input.value}`);
                            input.value = '';
                        }
                    }}
                >
                    Send Command
                </button>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<App />);
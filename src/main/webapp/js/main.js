let ws;
function tableclear()
{
    let table = document.getElementById("user-table").getElementsByTagName('tbody')[0];
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
}

function word() {
    let callURL = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(response => {

            let table = document.getElementById("random-items").getElementsByTagName('tbody')[0];

            while (table.firstChild) {
                table.removeChild(table.firstChild);
            }

            const row = document.createElement('tr');
            const button = document.createElement('button');
            button.textContent = response;
            button.className = "joinRoomButton";
            row.appendChild(button);
            table.appendChild(row);

        }); // enter the room with the code
}


function sendCanvas() {
    var message = copyCanvas();
    if(ws == null)
    {
        return
    }
    ws.send(JSON.stringify(message));

}
function timestamp() {
    var d = new Date(), minutes = d.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return d.getHours() + ':' + minutes;
}

document.getElementById("input").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        let request = {"type":"chat", "msg":event.target.value};
        ws.send(JSON.stringify(request));
        event.target.value = "";
    }
});
function newRoom(){
    if (ws != null)
    {
        leaveRoom();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const log = document.getElementById("log");
    while (log.firstChild) {
        log.removeChild(log.firstChild);
    }
    // calling the ChatServlet to retrieve a new room ID
    let callURL= "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(response => {
            enterRoom(response);
            let table = document.getElementById("room-table").getElementsByTagName('tbody')[0];
            const row = document.createElement('tr');
            const button = document.createElement('button');
            button.textContent = response;
            button.className = "joinRoomButton";
            button.onclick = function() {
                enterRoom(response)
            };
            row.appendChild(button);
            table.appendChild(row);
        }); // enter the room with the code
}
function enterRoom(code) {
    if (ws != null)
    {
        leaveRoom();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const log = document.getElementById("log");
    while (log.firstChild) {
        log.removeChild(log.firstChild);
    }
    tableclear();


    // create the web socket
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + code);

    ws.onmessage = function (event) {
        let message = JSON.parse(event.data);

        if (message.type === "chat" && !message.message.endsWith(": ")) {
            // do something with the message
            {

                var log = document.getElementById("log");
                var newDiv = document.createElement("div");
                var messageSpan = document.createElement("span");
                var timestampSpan = document.createElement("span");

                if (log.children.length % 2 === 0) {
                    messageSpan.style.color = "blue";
                    timestampSpan.style.color = "green";
                } else {
                    messageSpan.style.color = "#AA336A";
                    timestampSpan.style.color = "green";
                }

                messageSpan.innerText = message.message;
                timestampSpan.innerText = "[" + timestamp() + "] ";

                newDiv.appendChild(timestampSpan);
                newDiv.appendChild(messageSpan);
                log.appendChild(newDiv);
            }

        }

        if (message.type == "user") {
            tableclear();


            usertable(message)
        }
        if (message.type === "canvas")
        {
            updateCanvasData(message.msg)
        }
        if (message.type == "background")
        {
            updateCanvasBoard(message.msg)

        }
    }
}
function enterRoomByCode() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tableclear();
    let code = document.getElementById("room-code").value;

    enterRoom(code);
    let table = document.getElementById("room-table").getElementsByTagName('tbody')[0];
    const row = document.createElement('tr');
    const button = document.createElement('button');
    button.textContent = code;
    button.className = "joinRoomButton";
    button.onclick = function () {
        enterRoom(code)
    };
    row.appendChild(button);
    table.appendChild(row);

}





function usertable(message) {

    const user = message.message;

    user.filter(item => typeof item === "string" && item !== "" && item !== "null")
        .forEach(item => {
                let table = document.getElementById("user-table").getElementsByTagName('tbody')[0];
                const row = document.createElement('tr');
                const button = document.createElement('button');
                button.className = "joinRoomButton";
                button.textContent = item;
                row.appendChild(button);
                table.appendChild(row);
            }
        );

}


document.getElementById("input").addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        let request = {"type": "chat", "msg": event.target.value};
        ws.send(JSON.stringify(request));
        event.target.value = "";
    }
});
function leaveRoom() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const log = document.getElementById("log");
    while (log.firstChild) {
        log.removeChild(log.firstChild);
        ws.close(); // assuming `ws` is your WebSocket object
        tableclear();
    }




}
function reload() {

    const log = document.getElementById("log");
    while (log.firstChild) {
        log.removeChild(log.firstChild);
    }
    tableclear();

    const table = document.getElementById("room-table").getElementsByTagName('tbody')[0];

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/");

    // parse messages received from the server and update the UI accordingly
    ws.onmessage = function (event) {
        // parsing the server's message as json
        let message = JSON.parse(event.data);

        if (message.type == "user") {
            tableclear();
            usertable(message);
        }

        if (message.type == "rooms") {

            roomtable(message)

        }

    }
}

function roomtable(message) {
    const rooms = message.message;
    rooms.filter(item => typeof item === "string" && item !== "" && item !== "null")
        .forEach(item => {
                let table = document.getElementById("room-table").getElementsByTagName('tbody')[0];
                const row = document.createElement('tr');
                const button = document.createElement('button');
                button.textContent = item;
                button.className = "joinRoomButton";
                button.onclick = function () {
                    enterRoom(item);
                };
                row.appendChild(button);
                table.appendChild(row);
            }
        );

}


const canvas = document.getElementById('myCanvas');
const toolbar = document.getElementById('toolbar');
var theInput = document.getElementById("favcolor");
var brushColor;

let ctx = canvas.getContext('2d');
let isPainting = false;
let lineWidth = 5;
let startX;
let startY;
toolbar.addEventListener('click', e => {
    if (e.target.id === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sendCanvas()
    }
});
const container = canvas.parentNode;

const resizeCanvas = () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
};

// Set initial canvas size
resizeCanvas();

// Add event listener to update canvas size when window is resized
window.addEventListener('resize', resizeCanvas);

const myCheckbox = document.getElementById('Eraser');
myCheckbox.addEventListener('change', () => {
    if (myCheckbox.checked) {
        ctx.strokeStyle = canvas.style.backgroundColor;

    }
});

const colorInput = document.getElementById('stroke');
colorInput.addEventListener('input', (e) => {
    brushColor = e.target.value;
    ctx.strokeStyle = brushColor;
    myCheckbox.checked = false;
});
toolbar.addEventListener('change', e => {

    if(e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }
});
theInput.addEventListener("change", function(){
    theColor = theInput.value;
    canvas.style.backgroundColor = theColor;
    // send message to server here
   sendColor(theColor)
}, false);
let saveBtn = document.querySelector(".save")
saveBtn.addEventListener("click", () => {
    let data = canvas.toDataURL("imag/png")
    let a = document.createElement("a")
    a.href = data
    a.download = "sketch.png"
    a.click()
})

const draw = (e) => {
    if (!isPainting) {
        return;
    }

    var adjustedX = (e.clientX - canvas.offsetLeft) * (canvas.width / canvas.offsetWidth);
    var adjustedY = (e.clientY - canvas.offsetTop) * (canvas.height / canvas.offsetHeight);

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(adjustedX, adjustedY);
    ctx.stroke();
}


canvas.addEventListener('mousedown', (e) => {
    sendCanvas()
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY;
});

canvas.addEventListener('mouseup', e => {
    sendCanvas()
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();
});

canvas.addEventListener('mousemove', draw)
{
}
function updateCanvasData(data) {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');


    for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor(i / (4 * canvas.width));

        // Copy pixel to second canvas
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const alpha = data[i + 3];


        // Fill pixel with same color on second canvas
        ctx.fillStyle = `rgba(${red},${green},${blue},${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }

}





function copyCanvas() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;

// create a 1D array of pixel data
    const pixelArray = [];
    for (let i = 0; i < pixelData.length; i += 4) {
        const red = pixelData[i];
        const green = pixelData[i + 1];
        const blue = pixelData[i + 2];
        const alpha = pixelData[i + 3];
        pixelArray.push(red, green, blue, alpha);
    }


// send pixel array to client
    const message = {
        type: 'canvas',
        msg: pixelArray,
    };
    return message;

}



function updateCanvasBoard(data) {
    const canvas = document.getElementById('myCanvas');
    canvas.style.backgroundColor = data[0];

}

function sendColor(theColor)
{
    theColor = [theColor]
    if(ws == null)
    {
        return
    }
    const message = {
        type: 'background',
        msg: theColor,
    };
    ws.send(JSON.stringify(message));
}

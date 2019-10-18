var iframe = document.createElement("iframe"),
    content = document.createElement("div"),
    doc, win;

content.className = "content";

iframe.src = "https://localhost:9001/portal/cosi_new/";
iframe.id = "#info-screen";
iframe.onload = function (event) {
    win = iframe.contentWindow;
    doc = iframe.contentDocument;

    // console.log(doc.body, window.name);

    doc.body.innerHTML = "";
    doc.body.appendChild(content);
    iframe.style.display = "block";
};

window.onmessage = function (msg) {
    content.innerHTML = msg.data.node;
};

document.body.appendChild(iframe);

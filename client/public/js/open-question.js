const openclose = (num) => {
    if (document.querySelector(`#detail${num}`).attributes.class.value == "") {
        document.querySelector(`#question${num}`).attributes.class.value = "col-12 value-ellipsis";
        document.querySelector(`#detail${num}`).attributes.class.value = "hidden";
        document.querySelector(`#openclose${num}`).innerHTML = `<i class="fas fa-angle-down"></i>Open`;
    } else {
        document.querySelector(`#question${num}`).attributes.class.value = "col-12 value";
        document.querySelector(`#detail${num}`).attributes.class.value = "";
        document.querySelector(`#openclose${num}`).innerHTML = `<i class="fas fa-angle-up"></i>Close`;
    }
}

const getOpenQuestion = async (offset) => {
    const ret = await getQuestion(true, offset);
    let html = "";
    if (!ret.success) {
        html += `<div class="row">`;
        html += `    <div class="col-1"></div>`;
        html += `    <div class="col-10 alert alert-danger">${ret.message}</div>`;
        html += `    <div class="col-1"></div>`;
        html += `</div>`;
        document.querySelector("#question-list").innerHTML = html;
        return;
    }
    if (ret.response.length == 0) {
        html += `<div class="row">`;
        html += `    <div class="col-1"></div>`;
        html += `    <div class="col-10 alert alert-info">Data Not Found</div>`;
        html += `    <div class="col-1"></div>`;
        html += `</div>`;
        document.querySelector("#question-list").innerHTML = html;
        return;
    }
    for (i=0; i < ret.response.length -1; i++) {
        const data = ret.response[i];
        html += `<div class="row">`;
        html += `    <div class="col-1"></div>`;
        html += `    <div class="col-10 item">`;
        html += `        <div class="col-12 info">QuestionID: ${data.id}</div>`;
        html += `        <div class="col-12 label" style="margin-top: 0;">Question</div>`;
        html += `        <div class="col-12 value-ellipsis" id="question${i}">${data.question}</div>`;
        html += `        <div class="hidden" id="detail${i}">`;
        if (data.url) {
            html += `            <div class="col-12 label">URL</div>`;
            html += `            <div class="col-12 value-ellipsis"><a href="${data.url}">${data.url}</a></div>`;
        }
        html += `            <div class="col-12 label">Answer</div>`;
        html += `            <div class="col-12 value">${data.answer}</div>`;
        html += `            <div class="col-12 label">Reward</div>`;
        html += `            <div class="col-12 value">${getBalance(data.reward)}LSK</div>`;
        html += `            <div class="col-12 label">Answered / Number</div>`;
        html += `            <div class="col-12 value">${data.answered} / ${data.num}</div>`;

        html += `            <div class="col-12 input-area">`;
        html += `                <div class="col-12 info"><input type="text" id="answer${i}" placeholder="Input Answer"></div>`;
        html += `                <button type="button" id="answer${i}" class="btn btn-sm" onclick="sendAnswer(${i})"><i class="fas fa-share-square"></i>Send Answer</button>`;
        html += `            </div>`;
        html += `        </div>`;
        html += `        <div class="col-12 button">`;
        html += `            <button type="button" id="openclose${i}" class="btn btn-sm" onclick="openclose(${i})"><i class="fas fa-angle-down"></i>Open</button>`;
        html += `        </div>`;
        html += `        <div class="col-12 info-right" style="padding-bottom: 5px;">Author: ${data.senderId}</div>`;
        html += `        <div class="col-12 info-right" style="padding-top: 5px;">Timestamp: ${getLocalDate(data.timestamp)}</div>`;
        html += `    </div>`;
        html += `    <div class="col-1"></div>`;
        html += `</div>`;
    }
    document.querySelector("#question-list").innerHTML = html;
}
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

const getCloseQuestion = async () => {
    const userId = document.querySelector("#address").value.toUpperCase();
    const offset = document.querySelector("#offset").value;
    const sort = document.querySelector("#sort-select").value;
    let param = `userId=${userId}&offset=${offset}`;
    if (sort) {
        const vals = sort.split('_');
        if (vals.length = 2) param += `&sortKey=${vals[0]}&sortType=${vals[1]}`;
    }
    const ret = await doGet(`${API_URL}/close-question`, param);
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
    for (i=0; i < ret.response.length; i++) {
        const data = ret.response[i];
        html += `<div class="row">`;
        html += `    <div class="col-1"></div>`;
        html += `    <div class="col-10 item">`;
        html += `        <div class="col-12 info"><i class="fas fa-lock"></i>QuestionID: ${data.id}</div>`;
        html += `        <div class="col-12 label" style="margin-top: 0;">Question</div>`;
        html += `        <div class="col-12 value-ellipsis" id="question${i}">${data.question}</div>`;
        html += `        <div class="hidden" id="detail${i}">`;
        if (!data.url) {
            html += `            <div class="col-12 label">URL <i class="fas fa-link"></i></div>`;
            html += `            <div class="col-12 value-ellipsis"><a href="${data.url}" target="_blank">http://www.google.com</a></div>`;
        }
        html += `            <div class="col-12 label">Answer</div>`;
        html += `            <div class="col-12 value">${data.answer}</div>`;
        html += `            <div class="col-12 label">Reward</div>`;
        html += `            <div class="col-12 value">${getBalance(data.reward)}LSK</div>`;
        html += `            <div class="col-12 label">Answered / Number <i class="fas fa-list-alt"></i></div>`;
        html += `            <div class="col-12 value" onclick="answeredInfo('${data.id}')"><a href="javascript:void 0;">${data.answered} / ${data.num}</a></div>`;
        html += `        </div>`;
        html += `        <div class="col-12 button">`;
        html += `            <button type="button" id="openclose${i}" class="btn btn-sm" onclick="openclose(${i})"><i class="fas fa-angle-down"></i>Open</button>`;
        html += `        </div>`;
        html += `        <div class="col-12 info-right" style="padding-bottom: 5px;">Questioner: ${data.senderId}</div>`;
        html += `        <div class="col-12 info-right" style="padding-top: 5px;">Timestamp: ${getLocalDate(data.timestamp)}</div>`;
        html += `    </div>`;
        html += `    <div class="col-1"></div>`;
        html += `</div>`;
    }
    document.querySelector("#question-list").innerHTML = html;
}

const reloadCloseQuestion = () => {
    let param = "";
    const offset = document.querySelector("#offset").value;
    if (offset) param += `offset=${offset}`;

    const sort = document.querySelector("#sort-select").value;
    if (sort) param += `&sort=${sort}`;
    location.href = `./close-question?${param}`;
}

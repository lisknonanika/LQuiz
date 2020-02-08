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

const getOpenQuestion = async () => {
    const userId = document.querySelector("#address").value.toUpperCase();
    const offset = document.querySelector("#offset").value;
    const sort = document.querySelector("#sort-select").value;
    let param = `userId=${userId}&offset=${offset}`;
    if (sort) {
        const vals = sort.split('_');
        if (vals.length = 2) param += `&sortKey=${vals[0]}&sortType=${vals[1]}`;
    }
    const ret = await doGet(`${API_URL}/open-question`, param);
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
        document.querySelector(".container .dropdown-toggle").style = "display:none"
        return;
    }
    for (i=0; i < ret.response.length; i++) {
        const data = ret.response[i];
        html += `<div class="row">`;
        html += `    <div class="col-1"></div>`;
        html += `    <div class="col-10 item">`;
        html += `        <div class="col-12 info"><i class="fas fa-lock-open"></i>QuestionID: ${data.id}</div>`;
        html += `        <div class="col-12 label" style="margin-top: 0;">Question</div>`;
        html += `        <div class="col-12 value-ellipsis" id="question${i}">${data.question}</div>`;
        html += `        <div class="hidden" id="detail${i}">`;
        if (data.url) {
            html += `            <div class="col-12 label">URL <i class="fas fa-link"></i></div>`;
            html += `            <div class="col-12 value-ellipsis" onclick="confirmOutLink('${data.url}');"><a href="javascript:void 0;">${data.url}</a></div>`;
        }
        html += `            <div class="col-12 label">Reward</div>`;
        html += `            <div class="col-12 value">${getBalance(data.reward)}LSK</div>`;
        html += `            <div class="col-12 label">Answered / Number <i class="fas fa-list-alt"></i></div>`;
        html += `            <div class="col-12 value" onclick="answeredInfo('${data.id}')"><a href="javascript:void 0;">${data.answered} / ${data.num}</a></div>`;
        html += `            <div class="col-12 input-area">`;
        html += `                <div class="col-12 info"><input type="text" id="answer${i}" placeholder="Input Answer"></div>`;
        html += `                <button type="button" id="answer${i}" class="btn btn-sm" onclick="sendAnswer(${i})"><i class="fas fa-share-square"></i>Send Answer</button>`;
        html += `            </div>`;
        html += `        </div>`;
        html += `        <div class="col-12 button">`;
        html += `            <button type="button" id="openclose${i}" class="btn btn-sm" onclick="openclose(${i})"><i class="fas fa-angle-down"></i>Open</button>`;
        html += `        </div>`;
        html += `        <div class="col-12 info-right" style="padding-bottom: 5px;">Questioner: ${data.senderId}</div>`;
        html += `        <div class="col-12 info-right" style="padding-top: 5px;">Timestamp: ${getLocalDate(data.timestamp)}</div>`;
        html += `        <input type="hidden" id="questionId${i}" value="${data.id}">`;
        html += `        <input type="hidden" id="answerHash${i}" value="${data.answer}">`;
        html += `    </div>`;
        html += `    <div class="col-1"></div>`;
        html += `</div>`;
    }
    const maxPage = ret.response.length > 0? Math.ceil(ret.response[0].max_count / 100): 1;
    const currentPage = isValidNumNoLimit(offset)? +offset + 1: 1;
    document.querySelector("#question-count").innerHTML = `Page: ${currentPage} / ${maxPage}`;
    document.querySelector("#question-count").style = `top: ${$('.navbar').height()+5}px`;
    if (maxPage > 1) {
        const prevPage = (+offset == 0)? 0: +offset - 1;
        const nextPage = (+currentPage == +maxPage)? +maxPage: +currentPage + 1;
        html += `<div id="question-page">`;
        html += `    <div class="col-2"></div>`;
        html += `    <div class="col-2 page" onclick="page(0)"><i class="fas fa-angle-double-left"></i></div>`;
        html += `    <div class="col-2 page" onclick="page(${prevPage})"><i class="fas fa-angle-left"></i></div>`;
        html += `    <div class="col-2 page" onclick="page(${nextPage - 1})"><i class="fas fa-angle-right"></i></div>`;
        html += `    <div class="col-2 page" onclick="page(${maxPage - 1})"><i class="fas fa-angle-double-right"></i></div>`;
        html += `    <div class="col-2"></div>`;
        html += `</div>`;
    }
    document.querySelector("#question-list").innerHTML = html;

}

const reloadOpenQuestion = () => {
    let param = "";
    const offset = document.querySelector("#offset").value;
    if (offset) param += `offset=${offset}`;

    const sort = document.querySelector("#sort-select").value;
    if (sort) param += `&sort=${sort}`;
    location.href = `./open-question?${param}`;
}

const page = (offset) => {
    let param = `offset=${offset}`;
    const sort = document.querySelector("#sort-select").value;
    if (sort) param += `&sort=${sort}`;
    location.href = `./open-question?${param}`;
}

const sendAnswer = (num) => {
    const answer = document.querySelector(`#answer${num}`).value.trim().toUpperCase();
    if (!answer) {
        Swal.fire({text: "Answer is required", icon: 'error'});
        return;
    }
    const crypto = new jsSHA("SHA-256", "TEXT");
    crypto.update(answer)
    const hash = crypto.getHash("HEX");
    if (document.querySelector(`#answerHash${num}`).value != hash) {
        Swal.fire({text: "Answer missmatch", icon: 'error'});
        return;
    }
    if (document.querySelector("#address").value.toUpperCase() == "GUEST") {
        Swal.fire({text: "The answer is correct, but cannot be sent by the guest.", icon: 'warning'});
        return
    }

    Swal.fire({
        title: 'Input your passphrase',
        html: passphraseHtml,
        showCancelButton: true,
        confirmButtonText: 'Send Answer',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        preConfirm: async () => {
            const passphrase = getPassphraseValue();
            if (!passphrase) {
                Swal.showValidationMessage("Passphrase is required");
            } else if (!lisk.passphrase.Mnemonic.validateMnemonic(passphrase)) {
                Swal.showValidationMessage("Incorrect passphrase");
            } else {
                const json = {
                    address: document.querySelector("#address").value.toUpperCase(),
                    answer: document.querySelector(`#answer${num}`).value,
                    id: document.querySelector(`#questionId${num}`).value,
                    passphrase: passphrase
                }
                const ret = await doPost(`${API_URL}/answer`, json);
                if (!ret.success) Swal.showValidationMessage(ret.messages? ret.messages[0]: "Send Failed");
                else return ret.response.id;
            }
        }
    }).then((result) => {
        if (!result.value) Swal.showValidationMessage("Send Failed");
        else {
            Swal.fire({
                html: `
                    <div>Success!</div>
                    <div class="cofirm-content">${result.value}</div>
                `,
                icon: 'success'
            }).then((result) => {
                location.reload();
            });
        }
    })
}
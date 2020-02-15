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

const getQuestion = async (path, param) => {
    const ret = await doGet(`${API_URL}/${path}`, param);
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
        const selectObj = document.querySelector(".container .dropdown-toggle");
        if (selectObj) selectObj.style = "display:none";
        return;
    }
    for (i=0; i < ret.response.length; i++) {
        const data = ret.response[i];
        const closeStyle = (data.answered >= data.num)? "close-question": "";
        const closeBorderStyle = (data.answered >= data.num)? "close-question-border": "";
        html += `<div class="row">`;
        html += `    <div class="col-1"></div>`;
        html += `    <div class="col-10 item ${closeBorderStyle}">`;
        html += `        <div class="col-12 info"><i class="fas fa-lock-open"></i>QuestionID: <a href="${EXPLORER_URL}/tx/${data.id}" target="_blank" style="display:inline-block;font-weight:normal !important;">${data.id}</a></div>`;
        html += `        <div class="col-12 label ${closeStyle}" style="margin-top: 0;">Question</div>`;
        html += `        <div class="col-12 value-ellipsis ${closeBorderStyle}" id="question${i}">${data.question}</div>`;
        html += `        <div class="hidden" id="detail${i}">`;
        if (data.url) {
            html += `            <div class="col-12 label ${closeStyle}">URL <i class="fas fa-link"></i></div>`;
            html += `            <div class="col-12 value-ellipsis ${closeBorderStyle}" onclick="confirmOutLink('${data.url}');"><a href="javascript:void 0;">${data.url}</a></div>`;
        }
        html += `            <div class="col-12 label ${closeStyle}">Reward</div>`;
        html += `            <div class="col-12 value ${closeBorderStyle}">${getBalance(data.reward)}LSK</div>`;
        html += `            <div class="col-12 label ${closeStyle}">Answered / Number <i class="fas fa-list-alt"></i></div>`;
        html += `            <div class="col-12 value ${closeBorderStyle}" onclick="answeredInfo('${data.id}')"><a href="javascript:void 0;">${data.answered} / ${data.num}</a></div>`;
        if (path == "open-question") {
            html += `            <div class="col-12 input-area">`;
            html += `                <div class="col-12 info"><input type="text" id="answer${i}" placeholder="Input Answer"></div>`;
            html += `                <button type="button" id="answer${i}" class="btn btn-sm" onclick="sendAnswer(${i})"><i class="fas fa-share-square"></i>Send Answer</button>`;
            html += `            </div>`;
        }
        html += `        </div>`;
        html += `        <div class="col-12 button">`;
        html += `            <button type="button" id="openclose${i}" class="btn btn-sm" onclick="openclose(${i})"><i class="fas fa-angle-down"></i>Open</button>`;
        html += `        </div>`;
        html += `        <div class="col-12 info-right" style="padding-bottom: 5px;">Questioner: <a href="${EXPLORER_URL}/address/${data.senderId}" target="_blank" style="display:inline-block;font-weight:normal !important;">${data.senderId}</a></div>`;
        html += `        <div class="col-12 info-right" style="padding-top: 5px;">Timestamp: <span style="font-weight:normal !important;">${getLocalDate(data.timestamp)}</span></div>`;
        html += `        <input type="hidden" id="questionId${i}" value="${data.id}">`;
        html += `        <input type="hidden" id="answerHash${i}" value="${data.answer}">`;
        html += `    </div>`;
        html += `    <div class="col-1"></div>`;
        html += `</div>`;
    }
    const maxPage = ret.response.length > 0? Math.ceil(ret.response[0].max_count / 100): 1;
    const currentPage = isValidNumNoLimit(offset)? +offset + 1: 1;
    document.querySelector("#question-total-count").innerHTML = `Total: ${ret.response[0].max_count}`;
    document.querySelector("#question-total-count").style = `top: ${$('.navbar').height()+5}px`;
    document.querySelector("#question-page-count").innerHTML = `Page: ${currentPage} / ${maxPage}`;
    document.querySelector("#question-page-count").style = "";
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

const reloadQuestion = () => {
    let param = "";
    const offset = document.querySelector("#offset").value;
    if (offset) param += `offset=${offset}`;

    const filterElem = document.querySelector("#filter");
    if (filterElem && filterElem.value) param += `&filter=${filterElem.value}`;

    const sortElem = document.querySelector("#sort-select");
    if (sortElem && sortElem.value) param += `&sort=${sortElem.value}`;
    location.href = `${location.pathname}?${param}`;
}

const page = (offset) => {
    document.querySelector("#offset").value = offset;
    reloadQuestion();
}

const sendAnswer = (num) => {
    const answer = document.querySelector(`#answer${num}`).value.trim().toUpperCase();
    if (!answer) {
        Swal.fire({text: "Answer is required", allowOutsideClick: false, icon: 'error'});
        return;
    }
    const crypto = new jsSHA("SHA-256", "TEXT");
    crypto.update(answer)
    const hash = crypto.getHash("HEX");
    if (document.querySelector(`#answerHash${num}`).value != hash) {
        Swal.fire({text: "Answer missmatch", allowOutsideClick: false, icon: 'error'});
        return;
    }
    if (document.querySelector("#address").value.toUpperCase() == "GUEST") {
        Swal.fire({text: "The answer is correct, but cannot be sent by the guest.", allowOutsideClick: false, icon: 'warning'});
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
                    <div style="color: #FF4557;font-size:0.8rem;">Reflected in about 15 seconds.</div>
                    <a href="./my-answered" style="font-size:0.8rem;">Added to "My Answer Page".</a>
                `,
                allowOutsideClick: false, 
                icon: 'success'
            }).then((result) => {
                location.reload();
            });
        }
    })
}

const filter = () => {
    const filter = document.querySelector("#filter").value;
    Swal.fire({
        html: `
            <h4>Input Filter</h4>
            <input type="text" id="filter-text" placeholder="QuestionID or Questioner" value="${filter}">
        `,
        showCancelButton: true,
        confirmButtonText: 'Search',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        preConfirm: () => {
            return document.querySelector("#filter-text").value.trim().toUpperCase();
        }
    }).then((result) => {
        if (result.value !== undefined) {
            document.querySelector("#filter").value = result.value;
            reloadQuestion();
        }
    })
}

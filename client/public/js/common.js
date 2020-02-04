const doPost = (url, param) => {
    const fetchParam = {
        mode: 'cors',
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=UTF-8"
        }
    };
    if (param) fetchParam.body = JSON.stringify(param);
    return fetch(url, fetchParam)
    .then((res) => {return res.json()})
    .then((json) => {return json})
    .catch((err) => {
        console.log(err);
        return {success: false, err: `POST Failed: ${url}`}
    });
}

const doGet = (url, param) => {
    const fetchParam = {
        mode: 'cors'
    };
    return fetch(`${url}?${param}`, fetchParam)
    .then((res) => {return res.json()})
    .then((json) => {return json})
    .catch((err) => {
        console.log(err);
        return {success: false, err: `GET Failed: ${url}`}
    });
}

const passphraseHtml = `
    <input type="password" id="p1" class="passphrase" placeholder="1" oninput="setPassphrase(1)">
    <input type="password" id="p2" class="passphrase" placeholder="2" oninput="setPassphrase(2)">
    <input type="password" id="p3" class="passphrase" placeholder="3" oninput="setPassphrase(3)">
    <input type="password" id="p4" class="passphrase" placeholder="4" oninput="setPassphrase(4)">
    <input type="password" id="p5" class="passphrase" placeholder="5" oninput="setPassphrase(5)">
    <input type="password" id="p6" class="passphrase" placeholder="6" oninput="setPassphrase(6)">
    <input type="password" id="p7" class="passphrase" placeholder="7" oninput="setPassphrase(7)">
    <input type="password" id="p8" class="passphrase" placeholder="8" oninput="setPassphrase(8)">
    <input type="password" id="p9" class="passphrase" placeholder="9" oninput="setPassphrase(9)">
    <input type="password" id="p10" class="passphrase" placeholder="10" oninput="setPassphrase(10)">
    <input type="password" id="p11" class="passphrase" placeholder="11" oninput="setPassphrase(11)">
    <input type="password" id="p12" class="passphrase" placeholder="12" oninput="setPassphrase(12)">
`;

const getPassphraseValue = () => {
    let passphrase =
    document.querySelector("#p1").value.trim() + " " +
    document.querySelector("#p2").value.trim() + " " +
    document.querySelector("#p3").value.trim() + " " +
    document.querySelector("#p4").value.trim() + " " +
    document.querySelector("#p5").value.trim() + " " +
    document.querySelector("#p6").value.trim() + " " +
    document.querySelector("#p7").value.trim() + " " +
    document.querySelector("#p8").value.trim() + " " +
    document.querySelector("#p9").value.trim() + " " +
    document.querySelector("#p10").value.trim() + " " +
    document.querySelector("#p11").value.trim() + " " +
    document.querySelector("#p12").value.trim();
    return passphrase.trim();
}

const setPassphrase = (n) => {
    const elem = document.querySelector(`#p${n}`);
    const vals = elem.value.toLowerCase().split(" ");
    const val = vals.shift().trim();
    elem.value = val;
    if (val.length == 0) elem.style="";
    else if (lisk.passphrase.Mnemonic.wordlists.EN.indexOf(val) >= 0) elem.style="color: #254898";
    else elem.style="color: #FF4557";
    if (vals.length === 0 || n >= 12 || n < 1) return;
    document.querySelector(`#p${n+1}`).focus();
    document.querySelector(`#p${n+1}`).value = vals.join(" ");
    setPassphrase(n+1);
}

const login = (redirectUrl) => {
    Swal.fire({
        title: 'Input your passphrase',
        html: passphraseHtml,
        showCancelButton: true,
        confirmButtonText: 'Login',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        preConfirm: () => {
            const passphrase = getPassphraseValue();    
            if (!passphrase) {
                Swal.showValidationMessage("Passphrase is required");
            } else if (!lisk.passphrase.Mnemonic.validateMnemonic(passphrase)) {
                Swal.showValidationMessage("Incorrect passphrase");
            } else {
                return passphrase;
            }
        }
    }).then((result) => {
        if (!result.value) return;
        (async() => {
            const ret = await doPost("/login", {passphrase: result.value})
            if (ret.success) location.href = redirectUrl? redirectUrl: location.href;
            else Swal.showValidationMessage("Login Failed");
        })().catch((err) => {
            Swal.showValidationMessage("Login Failed");
        })
    })
}

const createAccount = () => {
    const passphrase = lisk.passphrase.Mnemonic.generateMnemonic();
    const address = lisk.cryptography.getAddressFromPassphrase(passphrase);
    Swal.fire({
        title: '',
        html: `
            <h4>Address</h4>
            <div style="background-color: #eee;padding:10px;border-radius:5px;">${address}</div>
            <br>
            <h4>Passphrase</h4>
            <div style="background-color: #eee;padding:10px;border-radius:5px;">${passphrase}</div>
            <div style="color: #FF4557;font-size:0.8rem;">passphrase cannot be restored. Never forget.</div>
            <div style="color: #FF4557;font-size:0.8rem;">You will receive 100 LSK for testing.</div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Login',
        allowOutsideClick: false,
        showLoaderOnConfirm: true,
        preConfirm: async() => {
            const faucet = await doPost("http://127.0.0.1:30001/api/faucet", {passphrase: passphrase})
            if (!faucet.success) {
                Swal.showValidationMessage("Login Failed");
            } else {
                const login = await doPost("/login", {passphrase: passphrase})
                if (!login.success) Swal.showValidationMessage("Login Failed");
                else return true;
            }
        }
    }).then((result) => {
        if (!result.value) return;
        else location.reload();
    })
}

const logout = () => {
    document.querySelector("#frm").action = "http://127.0.0.1:30002/logout";
    document.forms[0].submit();
}

const getQuestion = async (isOpen, offset) => {
    const url = isOpen? "oepn-question": "close-question"
    const userId = document.querySelector("#address").value.toUpperCase();
    const param = `userId=${userId}&offset=${offset}`;
    const ret = await doGet(`http://127.0.0.1:30001/api/${url}`, param);
    document.querySelector("#question-list").innerHTML = JSON.stringify(ret.response);
}

const getQuestionByCondition = async (offset, id, senderId) => {
    let params = [];
    if (offset) params.push(`offset=${offset}`);
    if (id) params.push(`id=${id}`);
    if (senderId) params.push(`senderId=${senderId}`);

    let param = "";
    if (params.length > 0) param = params.join("&");
    const ret = await doGet("http://127.0.0.1:30001/api/question", param);
    document.querySelector("#question-list").innerHTML = JSON.stringify(ret.response);
}

const getMyQuestion = async (offset) => {
    const senderId = document.querySelector("#address").value.toUpperCase();
    await getQuestionByCondition(offset, "", senderId);
}

const getAnswerByCondition = async (offset, id, senderId, qid) => {
    let params = [];
    if (offset) params.push(`offset=${offset}`);
    if (id) params.push(`id=${id}`);
    if (senderId) params.push(`senderId=${senderId}`);
    if (qid) params.push(`qid=${qid}`);

    let param = "";
    if (params.length > 0) param = params.join("&");
    const ret = await doGet("http://127.0.0.1:30001/api/answer", param);
    document.querySelector("#answer-list").innerHTML = JSON.stringify(ret.response);
}

const getMyAnswer = async (offset) => {
    const senderId = document.querySelector("#address").value.toUpperCase();
    await getAnswerByCondition(offset, "", senderId, "");
}

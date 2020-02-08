const API_URL = "http://127.0.0.1:3101/api";

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
            const faucet = await doPost(`${API_URL}/faucet`, {passphrase: passphrase})
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

const answeredInfo = async (qid) => {
    let html = "";
    const ret = await getAnswerByCondition({qid: qid});
    if (!ret.success) {
        html += `<div class="alert alert-danger">Failed to get answered data</div>`;
    } else if (ret.response.length == 0) {
        html += `<div class="alert alert-info">Data Not Found</div>`;
    } else {
        html += `<div class="cofirm-content">`;
        for (i=0; i < ret.response.length; i++) {
            const data = ret.response[i];
            if (i < ret.response.length - 1) html += `<div>${data.senderId}&nbsp;(${getLocalDate(data.timestamp)})</div><hr>`;
            else html += `<div>${data.senderId}&nbsp;(${getLocalDate(data.timestamp)})</div>`;
        }
        html += `</div>`;
    }

    Swal.fire({
        title: '',
        html: html,
        confirmButtonText: 'OK',
        allowOutsideClick: false
    });
}

const logout = () => {
    document.querySelector("#frm").action = "./logout";
    document.forms[0].submit();
}

const getQuestionByCondition = async (params) => {
    let param = "";
    if (params) {
        let arr = [];
        if (params.offset) arr.push(`offset=${params.offset}`);
        if (params.id) arr.push(`id=${params.id}`);
        if (params.senderId) arr.push(`senderId=${params.senderId}`);
        if (arr.length > 0) param = arr.join("&");
    }
    return await doGet(`${API_URL}/question`, param);
}

const getAnswerByCondition = async (params) => {
    let param = "";
    if (params) {
        let arr = [];
        if (params.offset) arr.push(`offset=${params.offset}`);
        if (params.id) arr.push(`id=${params.id}`);
        if (params.senderId) arr.push(`senderId=${params.senderId}`);
        if (params.qid) arr.push(`qid=${params.qid}`);
        if (arr.length > 0) param = arr.join("&");
    }
    return await doGet(`${API_URL}/answer`, param);
}

const getBalance = (val) => {
    if (!val) return 0;
    else return lisk.transaction.utils.convertBeddowsToLSK(val);
}

const getLocalDate = (val) => {
    if (!val) return "";
    else return new Date((val * 1000) + Date.parse(lisk.transaction.constants.EPOCH_TIME)).toLocaleString();
}

const confirmOutLink = (url) => {
    Swal.fire({
        title: "",
        html: `
                <div>Make sure this URL is not dangerous.</div>
                <div class="cofirm-content" style="color :#DD557B;">${url}</div>
            `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Jump'
    }).then((result) => {
        if (result.value) window.open(url, "_blank");
    });
}
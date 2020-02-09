const sendQuestion = () => {
    const address = document.querySelector("#address").value.trim().toUpperCase();
    if (address == "GUEST") {
        Swal.fire({text: "Guests cannot submit questions.", icon: 'warning'});
        return;
    }

    const question = document.querySelector("#question").value.trim();
    if (!isValidLength(question, 1, 256)) {
        Swal.fire({text: "A question must be in the range 1-256 bytes.", icon: 'error'});
        return;
    }

    const answer = document.querySelector("#answer").value.trim();
    if (!isValidLength(answer, 1, 256)) {
        Swal.fire({text: "A answer must be in the range 1-256 bytes.", icon: 'error'});
        return;
    }

    const reward = document.querySelector("#reward").value.trim();
    if (!isValidBalance(reward)) {
        Swal.fire({text: "A reward must be in the range of 0.0000001 to 100 LSK.", icon: 'error'});
        return;
    }

    const num = document.querySelector("#num").value.trim();
    if (!isValidBalance(num)) {
        Swal.fire({text: "A num must be in the range of 1 to 100.", icon: 'error'});
        return;
    }

    const url = document.querySelector("#url").value.trim();
    if (url && !isValidUrl(url)) {
        Swal.fire({text: "A URL must be a valid URL.", icon: 'error'});
        return;
    }

    Swal.fire({
        title: 'Input your passphrase',
        html: passphraseHtml,
        showCancelButton: true,
        confirmButtonText: 'Send Question',
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
                    address: address,
                    question: question,
                    answer: answer,
                    reward: reward,
                    num: num,
                    url: url,
                    passphrase: passphrase
                }
                const ret = await doPost(`${API_URL}/question`, json);
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

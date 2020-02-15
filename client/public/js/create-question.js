const sendQuestion = async () => {
    const address = document.querySelector("#address").value.trim().toUpperCase();
    if (address == "GUEST") {
        Swal.fire({text: "Guests cannot submit questions.", allowOutsideClick: false, icon: 'warning'});
        return;
    }

    const question = document.querySelector("#question").value.trim();
    if (!isValidLength(question, 1, 256)) {
        Swal.fire({text: "A question must be in the range 1-256 bytes.", allowOutsideClick: false, icon: 'error'});
        return;
    }

    const answer = document.querySelector("#answer").value.trim();
    if (!isValidLength(answer, 1, 256)) {
        Swal.fire({text: "A answer must be in the range 1-256 bytes.", allowOutsideClick: false, icon: 'error'});
        return;
    }

    const reward = document.querySelector("#reward").value.trim();
    if (!isValidBalance(reward)) {
        Swal.fire({text: "A reward must be in the range of 0.0000001 to 100 LSK.", allowOutsideClick: false, icon: 'error'});
        return;
    }

    const num = document.querySelector("#num").value.trim();
    if (!isValidBalance(num)) {
        Swal.fire({text: "A num must be in the range of 1 to 100.", allowOutsideClick: false, icon: 'error'});
        return;
    }

    const url = document.querySelector("#url").value.trim();
    if (url && !isValidUrl(url)) {
        Swal.fire({text: "A URL must be a valid URL.", allowOutsideClick: false, icon: 'error'});
        return;
    }

    const balance = await getAccountBalance();
    if (+lisk.transaction.utils.BigNum(num).mul(reward).add("0.1") > +balance) {
        Swal.fire({text: "Not enough balance.", allowOutsideClick: false, icon: 'error'});
        return;
    }

    Swal.fire({
        html: `
            <div>Are the "Question" and "Answer" correct?</div>
            <div>The LSK used to submit the question is:</div>
            <div class="cofirm-content" style="color :#DD557B;">${lisk.transaction.utils.BigNum(num).mul(reward).add("0.1")} LSK</div>
        `,
        showCancelButton: true,
        allowOutsideClick: false,
        icon: 'question'
    }).then((result) => {
        if (!result.value) return;
        else {
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
                    } else if (lisk.cryptography.getAddressFromPassphrase(passphrase) != address) {
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
                            <div style="color: #FF4557;font-size:0.8rem;">Reflected in about 15 seconds.</div>
                            <a href="./my-question" style="font-size:0.8rem;">Added to "My Question Page".</a>
                        `,
                        allowOutsideClick: false,
                        icon: 'success'
                    }).then((result) => {
                        location.reload();
                    });
                }
            });
        }
    });
}

const sendQuestion = () => {
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
                    address: document.querySelector("#address").value.toUpperCase(),
                    question: document.querySelector("#question").value,
                    answer: document.querySelector("#answer").value,
                    reward: document.querySelector("#reward").value,
                    num: document.querySelector("#num").value,
                    url: document.querySelector("#url").value,
                    passphrase: passphrase
                }
                const ret = await doPost("http://127.0.0.1:30001/api/question", json);
                if (!ret.success) Swal.showValidationMessage(ret.messages? ret.messages[0]: "Send Failed");
                else return true;
            }
        }
    }).then((result) => {
        if (!result.value) Swal.showValidationMessage("Send Failed");
        else location.reload();
    })
}

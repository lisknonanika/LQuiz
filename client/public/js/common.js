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
    fetch(url, fetchParam)
    .then((res) => {res.json()})
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
    fetch(`${url}?${param}`, fetchParam)
    .then((res) => {res.json()})
    .then((json) => {return json})
    .catch((err) => {
        console.log(err);
        return {success: false, err: `GET Failed: ${url}`}
    });
}

const setPassphrase = (n) => {
    const vals = document.querySelector(`#p${n}`).value.split(" ");
    document.querySelector(`#p${n}`).value = vals[0].trim();
    for (i = 1; i < vals.length; i++) {
        if (n + i > 12) return;
        document.querySelector(`#p${n+i}`).value = vals[i].trim();
        document.querySelector(`#p${n+i}`).focus();
    }
}

const login = () => {
    Swal.fire({
        title: 'Input your passphrase',
        html: `
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
        `,
        showCancelButton: true,
        confirmButtonText: 'Login',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        preConfirm: () => {
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

            passphrase = passphrase.trim();
            if (!passphrase) {
                Swal.showValidationMessage("Passphrase is required");
            } else if (passphrase.split(" ").length != 12) {
                Swal.showValidationMessage("Incorrect passphrase");
            } else {
                return passphrase;
            }
        }
    }).then((result) => {
        if (result.value) {
            document.querySelector(".container").style = "visibility: hidden;";
            document.querySelector("#frm").action = "http://127.0.0.1:30002/login";
            document.querySelector("#frm").innerHTML = `<input type="password" name="passphrase" value="${result.value}">`;
            document.forms[0].submit();
            return true;
        }
    })
}

const logout = () => {
    document.querySelector("#frm").action = "http://127.0.0.1:30002/logout";
    document.forms[0].submit();
    return true;
}
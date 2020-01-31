const doPost = (url, param) => {
    const fetchParam = {
        mode: 'cors',
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(param)
    };
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

const doPost = (url, json) => {
    const fetchParam = {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json;"
        },
        body: JSON.stringify(json)
    };
    fetch(url,fetchParam)
    .then((res) => {res.json()})
    .then((json) => {return json})
    .catch((err) => {
        console.log(err);
        return {success: false, err: `POST Failed: ${url}`}
    });
}

const doGet = (url, param) => {
    fetch(`${url}?${param}`)
    .then((res) => {res.json()})
    .then((json) => {return json})
    .catch((err) => {
        console.log(err);
        return {success: false, err: `GET Failed: ${url}`}
    });
}

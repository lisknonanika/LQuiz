const adjust = () => {
    document.querySelector('.container').style = "visibility: hidden;";
    const container = document.querySelector('.container');
    const ch = container.offsetHeight;
    const wh = window.innerHeight;
    if (wh > ch) container.style = `margin-top: ${(wh-ch) / 2}px`
    else container.style = `margin-top: 5px`
}
onload = adjust;

window.addEventListener('resize', () => {
    document.querySelector('.container').style = "visibility: hidden;";
    setTimeout(function(){
        adjust();
    }, 100);
});

const guestLogin = () => {
    document.querySelector(".container").style = "visibility: hidden;";
    document.querySelector("#frm").action = "./guest";
    document.forms[0].submit();
    return true;
}
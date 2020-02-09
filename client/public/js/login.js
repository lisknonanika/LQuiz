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

const whatIsLQuiz = () => {

    Swal.fire({
        title: "",
        html: `
            <div class="howto-content">
                <div style="font-weight:bold;">- What's LQuiz ? -</div>
                <div class="value">PoC built with Lisk SDK.</div>
                <br>
                <div style="font-weight:bold;">- Why LQuiz ? -</div>
                <div class="value">
                    <div>Some people find it difficult to get an LSK and initialize an account.</div>
                    <div>So, I thought it would be nice to be able to get an LSK with a simple game and initialize my account.</div>
                    <div>LSK is not required when answering questions.</div>
                    <div>If the answer is correct, LSK acquisition and account initialization will be performed.</div>
                </div>
                <br>
                <div style="font-weight:bold;">- Next LQuiz ? -</div>
                <div class="value">
                    <div>I think that with a slight change to the content, it will be possible to make a work request.</div>
                    <div>For example, enter a work description in "Question".</div>
                    <div>After confirming the completion of work, give the work contractor an "answer".</div>
                    <div>Of course, it is possible for the ordered to enter the answer and not pay.</div>
                    <div>It is necessary to judge whether this act is appropriate or inappropriate.</div>
                    <div>And must also consider penalties for improper use.</div>
                </div>
            </div>
        `,
        allowOutsideClick: false
    });
}

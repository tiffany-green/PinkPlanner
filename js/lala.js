function updateLala() {
    const image = document.getElementById("lala-image");
    const message = document.getElementById("lala-message");

    if (!image || !message) {
        console.log("Lala image area not found.");
        return;
    }

    const today = new Date();

    const month = today.getMonth();
    const day = today.getDate();
    const weekday = today.getDay();

    let lalaFile;
    let lalaMessage;

    // SPECIAL DAYS

    if (month === 0 && day === 1) {
        lalaFile = "lala-newyear.png";
        lalaMessage = "Happy New Year! ✨";
    }

    else if (month === 1 && day === 14) {
        lalaFile = "lala-valentines.png";
        lalaMessage = "Sending office puppy love! 💕";
    }

    else if (month === 9 && day === 31) {
        lalaFile = "lala-halloween.png";
        lalaMessage = "Happy Howl-o-ween! 🎃";
    }

    else if (month === 11 && day >= 15) {
        lalaFile = "lala-christmas.png";
        lalaMessage = "Santa Paws is coming! 🎄";
    }


    // WEEKDAYS

    else if (weekday === 1) {
        lalaFile = "lala-monday.png";
        lalaMessage = "Monday supervisor reporting for duty.";
    }

    else if (weekday === 2) {
        lalaFile = "lala-tuesday.png";
        lalaMessage = "Just checking on the schedule 👀";
    }

    else if (weekday === 3) {
        lalaFile = "lala-wednesday-2.0.png";
        lalaMessage = "Midweek nap break. 💤";
    }

    else if (weekday === 4) {
        lalaFile = "lala-thursday.png";
        lalaMessage = "Almost Friday!";
    }

    else if (weekday === 5) {
        lalaFile = "lala-friday-2.0.png";
        lalaMessage = "Lala has entered weekend mode. 🎉";
    }


    // WEEKENDS = SEASONAL LALA

    else {
        if (month === 11 || month === 0 || month === 1) {
            lalaFile = "lala-winter.png";
            lalaMessage = "Cozy weekend mode ❄️";
        }

        else if (month >= 2 && month <= 4) {
            lalaFile = "lala-spring.png";
            lalaMessage = "Spring has sprung! 🌸";
        }

        else if (month >= 5 && month <= 7) {
            lalaFile = "lala-summer.png";
            lalaMessage = "Summer office vibes ☀️";
        }

        else {
            lalaFile = "lala-autumn.png";
            lalaMessage = "Feeling fall-tastic 🍂";
        }
    }


    console.log(
        "Today is weekday:",
        weekday,
        "Loading:",
        lalaFile
    );

    image.src =
        `assets/lala/${lalaFile}?v=${Date.now()}`;

    message.textContent =
        lalaMessage;
}


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        updateLala
    );
} else {
    updateLala();
}
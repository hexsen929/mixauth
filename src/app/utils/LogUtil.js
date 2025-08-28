import dayjs from "dayjs";
import 'colors'
import 'server-only'

export default function logC(color, ...args) {
    let colors = ['green', 'red', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'];
    if (typeof color === "number") {
        color = colors[color];
    }
    let brights = ["Red", "Green", "Yellow", "Blue", "Magenta", "Cyan", "White"];
    let bright = brights.find((element) => {
        return element.toLowerCase() === color.toLowerCase();
    })
    if (bright) {
        color = "bright" + bright;
    }
    let time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let prefix = `[${time}]:`
    let output = prefix + " " + args.join(" ")
    console.log(output[color]);
}

export function logError(...args) {
    logC('red', '[Error]', ...args);
}

export function logInfo(...args) {
    logC('green', '[Info]', ...args);
}

export function logWarn(...args) {
    logC('yellow', '[Warn]', ...args);
}
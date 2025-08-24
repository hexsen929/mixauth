export function arrayBufferToBase64(input) {
    let buffer;

    if (input instanceof ArrayBuffer) {
        buffer = Buffer.from(input);
    } else if (ArrayBuffer.isView(input)) { // TypedArray 判断
        buffer = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
    } else {
        throw new TypeError('Input must be ArrayBuffer or TypedArray');
    }

    return buffer.toString('base64');
}
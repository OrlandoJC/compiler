const makeFileFromText = text => {
    const dataBlob = new Blob([text], { type : "text/plain"})
    const textFile = window.URL.createObjectURL(dataBlob);

    return textFile
}

export const downloadFile = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `${name}.txt`);
    a.click();
}

export default makeFileFromText

export default function downloadTable(containerHTML) {
    let pdf = new jsPDF('p', 'pt', 'a3');

    let source = containerHTML

    let specialElementHandlers = {
        '#bypassme': function (element, renderer) {
            return true
        }
    }
    let margins = {
        top: 80,
        bottom: 60,
        left: 40,
        width: 522
    }
    pdf.fromHTML("<h1>Tabla de triplos</h1>", 40, 10)
    pdf.fromHTML(
        source,
        margins.left,
        margins.top, {
        'width': margins.width,
    },function (dispose) {
        pdf.save('triplo.pdf');
    }, margins );
}

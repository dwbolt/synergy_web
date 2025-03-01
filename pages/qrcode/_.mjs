
//<script> {src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
//import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.esm.js';


const {page_         }  = import('/UX/page_.mjs')
const {QRCode        }  = import('./qrcode.mjs')

export class page_qrcode extends page_ {


generateQRCode() {
    const url    = document.getElementById('urlInput').value;
    const canvas = document.getElementById('qrCanvas');

    if (!url) {
        app.sfc_dialog.show_error('Please enter a valid URL.');
        return;
    }

    QRCode.toCanvas(canvas, url, {
        errorCorrectionLevel: 'H' // Set the error correction level to 'H' for high
    }, function (error) {
        if (error) {
            console.error(error);
            app.sfc_dialog.show_error(`Error generating QR code. error=${error}`);
        } else {
            console.log('QR code generated successfully with high error correction!');
        }
    });
}

downloadQRCode() {
    // download qrcode to local computer
    const canvas  = document.getElementById('qrCanvas');
    const link    = document.createElement('a');
    link.href     = canvas.toDataURL('image/jpeg');  // Converts the canvas to JPEG format
    link.download = 'qrcode.jpg';  // Sets the file name for download
    link.click();  // Triggers the download
}


}


const page                       = new page_qrcode(app.page_json.url_dir);  // give app access to page methods
app.pages[app.page_json.url_dir] = page;
await page.init(app.page_json);      // app.page_json was defined app_24-08.mjs

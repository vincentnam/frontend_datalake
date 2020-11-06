const IncomingForm = require('formidable').IncomingForm

module.exports = function upload(req, res) {
    if(!req.files) {
        res.send({
            status: false,
            message: 'No file uploaded'
        })
    }

    var form = new IncomingForm()
    form.uploadDir = "/datalake_tmp"
    // req.encoding(null)
    // var bodyParser = require('body-parser');
    // var options = {
    //     inflate: true,
    //     limit: '100kb',
    //     type: 'application/octet-stream'
    // };
    // req.app.use(bodyParser.raw(options));
    // console.log(res)
    // console.log(res.header)
    // console.log(res.body)

    form.on('file', (field, file) => {
        // Do something with the file
        // e.g. save it to the database
        // you can access it using file.path
        // console.log(field)
        console.log(file)
        console.log(file.readFile)
    })
    form.on('end', () => {
        res.json()
    })
    form.parse(req)
}
const IncomingForm = require('formidable').IncomingForm
const request = require('request')
const streamBuffers = require('stream-buffers')
const Swiftclient = require('openstack-swift-client')
const authenticator = new Swiftclient.SwiftAuthenticator('http://141.115.103.30:8080/auth/v1.0', 'test:tester', 'testing');
const client = new Swiftclient(authenticator)
const stream_lib = require("stream")
const mongo = require("mongodb")
module.exports = function upload(req, res) {
    let body = []
    let segments = []
    let counter = 0
    let SLO = false
    const segments_size = 1000000000 // 1Go
    req.on('data',(chunk)=>{
        body.push(chunk);
        // console.log(chunk.length)
        if( counter >= segments_size){
            segments.push(body)
            body = []
            counter = 0
            SLO = true
        }
        counter += chunk.length
    }).on('end',async ()=>{
        const container_name = "my-test2"
        let container = client.container(container_name);
        const filename = "test2"

        if (SLO){
            let manifestList = []
            // Push the last chunk to segments array
            segments.push(body)
            for (let i = 0; i < segments.length; i++){
                console.log("Segment " + i.toString())
                const buffer = Buffer.concat(segments[i])
                const stream = new stream_lib.Readable()
                stream.__read = () => {}
                stream.push(buffer)

                stream.push(null)
                let etag = {}
                await container.create(i.toString() +"_"+filename, stream).then( etag=> {
                    etag = {...etag}
                }
                )

                manifestList.push(
                    {
                        path:container_name+"/"+filename+i.toString(),
                        etag,
                        size_bytes: buffer.length
                    }
                )

            }
            console.log("Parts sent")
            console.log(manifestList)
            await container.create({
                name: filename,
                query:{
                    'multipart-manifest':'put'
                },
                content: manifestList
            })
            console.log("Manifest sent")
        }
        else{
            const stream = new stream_lib.Readable()
            stream.__read = () => {}


            const buffer = Buffer.concat(body)
            stream.push(buffer)
            stream.push(null)
            var MongoClient = mongo.MongoClient

            const mongo_url = "mongodb://141.115.103.31:27017"
            const dbName = "stats"
            var swift_id = -1
            MongoClient.connect(mongo_url, { useUnifiedTopology: true } ,function (err, client){
                    var res = {}
                    const coll = client.db(dbName).collection('swift');
                    coll.findOne({"type":"object_id_file"}, function (err, result){
                        // console.log(err)
                        console.log(result)
                        res = result
                        swift_id = res["object_id"]
                        console.log(result["object_id"])
                        // In the mongoDB callback -> we need to wait the answer
                        container.create(swift_id, stream).catch(e =>{
                                if (e.message === "HTTP 404"){
                                    client.create(container_name);
                                    container = client.container(container_name);
                                    container.create(result["object_id"], stream).then(console.log("Fichier ajouté !"));

                                    console.log("Rentre dans le 404")
                                }

                            }

                        )

                        client.db("swift").collection(container_name).insertOne({
                            "swift_id" : result["object_id"],
                            "filename": filename
                            //TODO: ADD OTHER METADATA NEEDED !!
                        })

                    })
                    coll.updateOne({"type":"object_id_file"}, {"$inc": {"object_id": 1}}, function (err, resp){
                        if (err) {
                            console.log("Update err")
                            console.log(err)
                        }
                        if (resp){
                            console.log("Update resp")
                            console.log(resp)
                        }
                    })
                }

            )
        }
        // console.log(container)
        // console.log(req.headers["filename"])






    })

}
// express_rest | ]
// express_rest | SwiftContainer {
//     express_rest |   childName: 'Object',
//     express_rest |   urlSuffix: '/my-container',
//     express_rest |   authenticator: SwiftAuthenticator {
//         express_rest |     _events: [Object: null prototype] {},
//         express_rest |     _eventsCount: 0,
//         express_rest |     _maxListeners: undefined,
//         express_rest |     _authenticate: [Function (anonymous)],
//         express_rest |     [Symbol(kCapture)]: false
//         express_rest |   }
//     express_rest | }

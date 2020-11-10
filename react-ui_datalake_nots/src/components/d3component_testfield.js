import React, {useEffect, useRef, useState} from 'react';
import * as d3 from "d3";
import * as axios from "axios";

import './d3component_testfield.css'
import $ from "jquery"

import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'
import {Form} from "react-bootstrap";
import ProgressBar from "./progressBar";
import log from "d3-scale/src/log";
import progressBar from "./progressBar";




export default function D3Test(props){

    const d3Container = useRef(null);
    const fileInputRef = useRef(null);
    // const uploadProgress = useRef({})
    // list of file in the dropzone
    const  [file_array, setFileArray] = useState([])
    // used in onDragLeave onDragOver onMouseOut onMouseOver
    const [ Highligth , setHighligth] = useState(false)
    // used in onDrop
    const [ Highlight_drop, setHighlight_drop] = useState(false )
    //
    const [ uploading, setUploading] = useState(false )
    // used in renderProgress
    const [ uploadProgress, setUploadProgress] = useState({})
    // const uploadProgress = {}
    // const setUploadProgress = (filename ,file_progress) =>{
    //     uploadProgress[filename] = file_progress
    // }
    // const setUploadProgress = (progress) =>{
    //     uploadProgress.current = progress
    // }
    // const add_progress = (filename , progress) => {
    //     const upload_prog = uploadProgress.current
    //     upload_prog[filename] = progress
    //     setUploadProgress(upload_prog)
    // }

    // used in renderProgress
    const [ successfullUploaded , setSuccessfullUploaded] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const fileListToArray = (list) => {
        const array = file_array;
        for (var i = 0; i < list.length; i++) {
            array.push(list.item(i));
        }
        setFileArray(array)
        // console.log(file_array)
    }
    const onFilesAdded = (evt) => {
        if (disabled) return;
        // console.log(evt.target.files)
        const files = evt.target.files;
        // const upload_progress = uploadProgress
        // Compatible ES5
        // Array.prototype.forEach.call(files, function(file) {});
        // Compatible ES6
        // Array.from(files).forEach(file => { upload_progress[file.name] = {state: "ready", percentage: 0} });

        fileListToArray(files);

        // setUploadProgress(upload_progress)
        const prog_map = uploadProgress
        for (var i = 0; i< files.length; i++){
            // prog_map.push(files.item(i).name:{"ok":"oui"})
            prog_map[files.item(i).name] = { state:"ready", percentage:0}
        }
        setUploadProgress(prog_map)
    }
    const openFileDialog = () => {
        if (props.disabled) return ;
        fileInputRef.current.click();
    }

    const onDrop = (evt)=>{
        evt.preventDefault();

        if (disabled) return;

        const files = evt.dataTransfer.files;
        if (props.onFilesAdded) {
            const array = fileListToArray(files);
            props.onFilesAdded(array);
        }
        setHighlight_drop(true)
    }
    const onDragLeave = ()=>{
        setHighligth(false)
    }
    const onDragOver = (evt)=>{
        evt.preventDefault();
        setHighligth(true)
    }
    const onMouseOut = () => {

        setHighligth(false)
    }
    const onMouseOver = () => {

        setHighligth(true)
    }

    // const renderProgress = (file) =>{
    //     // console.log(uploadProgress)
    //
    //     let upload_Progress= null
    //     if (file.name in uploadProgress.current){
    //         upload_Progress = uploadProgress.current[file.name]
    //     }
    //     else {
    //         upload_Progress = {state:"ready", percentage:0}
    //         add_progress(file.name, upload_Progress)
    //     }
    //     // const uploadProgress_file = { state:"ready", percentage:0}
    //     if (uploading || successfullUploaded ){
    //         return <div className="ProgressWrapper">
    //             <ProgressBar  progress={upload_Progress ? upload_Progress.percentage : 0}/>
    //             <img
    //                 className="CheckIcon"
    //                 alt="done"
    //                 src="images/checked.svg"
    //                 style={{
    //                     opacity:
    //                         uploadProgress && uploadProgress.state === "done" ? 0.5 : 0
    //                 }}
    //             />
    //         </div>
    //     }
    //
    // }
    const renderProgress = (file) => {
        const uploadProgress = uploadProgress[file.name];
        if (uploading || successfullUploaded) {
            return (
                <div className="ProgressWrapper">
                    <ProgressBar progress={uploadProgress ? uploadProgress.percentage : 0} />
                    <img
                        className="CheckIcon"
                        alt="done"
                        src="images/checked.svg"
                        style={{
                            opacity:
                                uploadProgress && uploadProgress.state === "done" ? 0.5 : 0
                        }}
                    />
                </div>
            );
        }
    }
    // UPDATE WHEN SUCCESSFULLUPLOADED DICT IS FILLED
    const renderActions = () =>{
        if (successfullUploaded) {
            return (
                <button
                    onClick={() =>{
                        setFileArray([])
                        setSuccessfullUploaded(false)
                        }

                    }
                >
                    Clear
                </button>
            );
        } else {
            return (
                <button
                    disabled={file_array.length < 0 || uploading}
                    onClick={uploadFiles}
                >
                    Upload
                </button>
            );
        }
    }
    // receives array of files that are done uploading when submit button is clicked
    //
    const sendRequest = async (file ) => {
        return new Promise((resolve, reject) => {
            console.log(file)
            const req = new XMLHttpRequest();
            const formdata = new FormData()
            // formdata.append("file",file, file.name)
            const blob = new Blob([file], {type: "application/octet-stream" , name:file.name})
            // const reader = new FileReader()
            // reader.onload = (function(theFile) {
            //     return function(e) {
            //         return e.target.result;
            //     };
            // });
            // reader.readAsArrayBuffer(file)
            // console.log(reader)
            formdata.append("file",blob )
            $.ajax({
                url:"http://127.0.0.1:5000/upload_file",
                type:"POST",
                data: file,
                cache:false,
                processData:false,
                contentType:"application/octet-stream",
                xhr: function()
                {
                    var xhr = new XMLHttpRequest();
                    //Upload progress
                    xhr.upload.addEventListener("progress", function(evt){
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total;
                            //Do something with upload progress
                            console.log(percentComplete);
                            uploadProgress[file.name].progress = percentComplete
                            console.log(uploadProgress[file.name])
                        }
                    }, false);
                    //Download progress
                    xhr.addEventListener("progress", function(evt){
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total;
                            //Do something with download progress
                            console.log(percentComplete);
                        }
                    }, false);
                    return xhr;
                },


            }).done(function(data){
                console.log(data)
            })
            // const formData = new FormData();
            // formData.append("file", file, file.name);
            //
            // req.open("POST", );
            // req.send(formData);
        // return new Promise((resolve, reject) => {
        //     // const req = new XMLHttpRequest();
        //     // req.upload.addEventListener("progress", event => {
        //     //     if (event.lengthComputable) {
        //     //         const copy = { ...uploadProgress };
        //     //         copy[file.name] = {
        //     //             state: "pending",
        //     //             percentage: (event.loaded / event.total) * 100
        //     //         };
        //     //         setUploadProgress({ uploadProgress: copy });
        //     //     }
        //     // });
        //     //
        //     // req.upload.addEventListener("load", event => {
        //     //     const copy = { ...uploadProgress };
        //     //     copy[file.name] = { state: "done", percentage: 100 };
        //     //     setUploadProgress({ uploadProgress: copy });
        //     //     resolve(req.response);
        //     // });
        //     // req.upload.addEventListener("error", event => {
        //     //     const copy = { ...uploadProgress };
        //     //     copy[file.name] = { state: "error", percentage: 0 };
        //     //     setUploadProgress({ uploadProgress: copy });
        //     //     reject(req.response);
        //     // });
        //     const formData = new FormData();
        //     const file_reader = new FileReader();
        //     // file_reader.readAsBinaryString(file)
        //     formData.append("file", new Blob([file], {type:"application/octet-stream"}) );
        //     // let s = JSON.stringify({ uri: localUri, name: filename, type: type });
        //     // let formData = new FormData();
        //     // formData.append('ph0t0', s);
        //     console.log(formData)
        //     console.log(file)
        //     axios.post("http://127.0.0.1:5000/upload_file", file, {
        //         method: "POST",
        //         headers: {
        //             keepAlive:false,
        //             'Content-Type': 'multipart/form-data'
        //         },
        //
        //         })
        //
        //
        //     //
        //     // fetch("http://127.0.0.1:5000/upload_file", {
        //     //     method:"POST",
        //     //     headers:{
        //     //         "Content-Type":"multipart/form-data"
        //     //     },
        //     //     mode:"cors",
        //     //     body: formData
        //     // })
        //     // req.open("POST", "http://127.0.0.1:5000/upload_file", true);
        //     // // req.setRequestHeader("Content-Type", "multipart/form-data")
        //     // req.send(formData);
        });
    }
    const uploadFiles = async () => {
        setUploadProgress({ uploadProgress: {}});
        setUploading(true )
        const promises = [];
        file_array.forEach(file => {
            promises.push(sendRequest(file));
        });
        try {
            await Promise.all(promises);
            setSuccessfullUploaded(true)
            setUploading(false)

        } catch (e) {
            // Not Production ready! Do some error handling here instead...
            setSuccessfullUploaded(false)
            setUploading(false)
            console.log(e)
            // this.setState({ successfullUploaded: true, uploading: false });
        }
    }
    useEffect(
        () => {
            // return (
            //
            // )

        },

        /*
            useEffect has a dependency array (below). It's a list of dependency
            variables for this useEffect block. The block will run after mount
            and whenever any of these variables change. We still have to check
            if the variables are valid, but we do not have to compare old props
            to next props to decide whether to rerender.
        */
        [ d3Container.current ])




    return (
    <div className={"Card"}>
        <div className="Upload">
            <span className="Title">Drag'n'drop input file zone</span>
            <div className= {`Dropzone ${ Highligth  ?  "Highlight" : ""} ${ Highlight_drop ? "Highlight_drop" : "" }`}
                 onDragOver={onDragOver}
                 onDragLeave={onDragLeave}
                 onDrop={onDrop}
                 onClick={openFileDialog}
                 onMouseOver={onMouseOver}
                 onMouseOut={onMouseOut}

                 style={{ cursor: props.disabled ? "default" : "pointer" }}>
                <img alt="upload"
                     className="Icon"
                     src={require("./images/folder.svg")}/>
                <input
                    ref={fileInputRef}
                    className="FileInput"
                    type="file"
                    multiple
                    onChange={onFilesAdded}
                />

                <span>Upload Files</span>
            </div>

            <div className="Content">
                <div>

                </div>
                <div className="Files">
                    {file_array.map(file => {
                        return (
                            <div key={file.name} className="Row">
                                <span className="Filename">{file.name}</span>
                                {renderProgress(file)}
                            </div>
                        );
                    })}

                </div>
            </div>
            <div className="Actions">{renderActions()}</div>
        </div>
</div>


    //     <div className= {`Dropzone ${ Highligth  ?  "Highlight" : ""} ${ Highlight_drop ? "Highlight_drop" : "" }`}
    //              onDragOver={onDragOver}
    //              onDragLeave={onDragLeave}
    //              onDrop={onDrop}
    //              onClick={openFileDialog}
    //              onMouseOver={onMouseOver}
    //              onMouseOut={onMouseOut}
    //              style={{ cursor: props.disabled ? "default" : "pointer" }}>
    //     <img alt="upload"
    //          className="Icon"
    //          src={require("./images/folder.svg")}/>
    //     <input
    //         ref={fileInputRef}
    //         className="FileInput"
    //         type="file"
    //         multiple
    //         onChange={onFilesAdded}
    //     />
    //
    //     <span>Upload Files</span>
    //     {thumbs}
    // </div>
    )


}
















// ##################################### SAVE ZONE ######################################

//
//
//
//
//
//
// import React, {useEffect, useRef, useState} from 'react';
// import * as d3 from "d3";
// import * as axios from "axios";
//
//
//
//
// import 'react-dropzone-uploader/dist/styles.css'
// import Dropzone from 'react-dropzone-uploader'
// import {Form} from "react-bootstrap";
//
//
//
//
// export default function D3Test(props){
//
//     const d3Container = useRef(null);
//     const Preview = ({ meta }) => {
//         const { name, percent, status } = meta
//         return (
//             <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
//       {name}, {Math.round(percent)}%, {status}
//     </span>
//         )
//     }
//     // const [books, setBooks] = useState(initialBooks)
//     // specify upload params and url for your files
//     const getUploadParams = ({ file, meta }) => {
//
//         return { url: 'http://127.0.0.1:5000/upload_file' ,
//             headers:
//                 {
//                     "Content-Type":"multipart/form-data",
//
//
//                 },
//         }
//
//     }
//     let  [,setState]=useState();
//     // called every time a file's `status` changes
//
//     async function send_data(fileWithMeta){
//         // const response = await fetch("http://127.0.0.1:5000/upload_file",{
//         //     method:"POST",
//         //     mode:"no-cors",
//         //     headers:{
//         //         "Content-Type":"multipart/form-data"
//         //     },
//         //     body: fileWithMeta.file
//         // }).then(response => {
//         //     console.log(response.json())})
//         return new Promise((resolve, reject) => {
//             const req = new XMLHttpRequest();
//
//             const formData = new FormData();
//             formData.append("file", fileWithMeta.file, fileWithMeta.meta.name);
//
//             req.open("POST", "http://127.0.0.1:5000/upload_file", true);
//             req.send(formData);
//         });
//     }
//
//     const handleSubmit = async (files, allFiles) => {
//         console.log(files.map(f => f.meta))
//         files.forEach(fileWithMeta => {
//
//
//                 // console.log("")
//                 // const url = "127.0.0.1:5000"
//                 // const method = 'POST'
//                 // // const body = fileWithMeta
//                 // const fields = {}
//                 // const headers = {"Content-Type":"multipart/form-data"}
//                 // const extraMeta = fileWithMeta.meta
//                 //
//                 // delete extraMeta.status
//                 //
//                 //
//                 // const xhr = new XMLHttpRequest()
//                 // const formData = new FormData()
//                 // xhr.open(method, 'http://127.0.0.1:5000/upload_file', true)
//                 //
//                 // for (const field of Object.keys(fields)) formData.append(field, fields[field])
//                 // xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
//                 // for (const header of Object.keys(headers)) xhr.setRequestHeader(header, headers[header])
//                 // fileWithMeta.meta = { ...fileWithMeta.meta, ...extraMeta }
//                 //
//                 // // update progress (can be used to show progress indicator)
//                 // xhr.upload.addEventListener('progress', e => {
//                 //     fileWithMeta.meta.percent = (e.loaded * 100.0) / e.total || 100
//                 //     setState({})
//                 // })
//                 //
//                 // xhr.addEventListener('readystatechange', () => {
//                 //     // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
//                 //     if (xhr.readyState !== 2 && xhr.readyState !== 4) return
//                 //
//                 //     if (xhr.status === 0 && fileWithMeta.meta.status !== 'aborted') {
//                 //         fileWithMeta.meta.status = 'exception_upload'
//                 //         // d3Container.current.handleChangeStatus(fileWithMeta)
//                 //         setState({})
//                 //     }
//                 //
//                 //     if (xhr.status > 0 && xhr.status < 400) {
//                 //         fileWithMeta.meta.percent = 100
//                 //         if (xhr.readyState === 2) fileWithMeta.meta.status = 'headers_received'
//                 //         if (xhr.readyState === 4) fileWithMeta.meta.status = 'done'
//                 //         // d3Container.current.handleChangeStatus(fileWithMeta)
//                 //         setState({})
//                 //     }
//                 //
//                 //     if (xhr.status >= 400 && fileWithMeta.meta.status !== 'error_upload') {
//                 //         fileWithMeta.meta.status = 'error_upload'
//                 //         // d3Container.current.handleChangeStatus(fileWithMeta)
//                 //         setState({})
//                 //     }
//                 // })
//                 //
//                 // formData.append('file', fileWithMeta.file)
//                 // if (props.timeout) xhr.timeout = props.timeout
//                 // xhr.send( formData)
//                 // fileWithMeta.xhr = xhr
//                 // fileWithMeta.meta.status = 'uploading'
//                 //
//                 // // d3Container.current.handleChangeStatus(fileWithMeta)
//                 // setState({})
//                 // // const body = new FormData()
//                 // // body.append("file",file)
//                 // // const config = {
//                 // //     onUploadProgress: function(progressEvent) {
//                 // //         var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
//                 // //         file.meta.percent = percentCompleted
//                 // //         console.log(percentCompleted)
//                 // //     }
//                 // // }
//                 // // let data = new FormData()
//                 // // axios.defaults.headers.post['Content-Type'] ="multipart/form-data";
//                 // // data.append('file', file.file)
//                 // // // let send = async send_data => {}
//                 // // axios.post("http://127.0.0.1:5000/upload_file",data, config )
//                 // //
//                 // //
//
//             }
//         )
//     }
//     // receives array of files that are done uploading when submit button is clicked
//
//     useEffect(
//         () => {
//             // return (
//             //
//             // )
//         },
//
//         /*
//             useEffect has a dependency array (below). It's a list of dependency
//             variables for this useEffect block. The block will run after mount
//             and whenever any of these variables change. We still have to check
//             if the variables are valid, but we do not have to compare old props
//             to next props to decide whether to rerender.
//         */
//         [props.data, d3Container.current])
//
//
//
//
//
//
//     return                               <Dropzone
//         // getUploadParams={getUploadParams}
//         // onChangeStatus={}
//         onSubmit={handleSubmit}
//         autoUpload={false}
//         PreviewComponent={Preview}
//         inputContent="Drop Files (Custom Preview)"
//         // disabled={true}//{files => files.some(f => ['preparing', 'getting_upload_params', 'uploading'].includes(f.meta.status))}
//         // submitButtonDisabled={files => files.length < 1}
//
//     />
// }



import React, {useEffect, useRef, useState} from 'react';


export default function ProgressBar(props){
    const [progress, setProgress]=useState(0)
    return (
        <div className="ProgressBar">
            <div className="Progress"
            style={{ width: progress + ' %'}}
            />
        </div>

    )


}

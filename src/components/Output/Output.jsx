import React from 'react';
import './Output.css'

const Output = ({ output }) => {
    return (
        <div className='output-container'>

            <div className='output-header'>
                <span className='output-title'>Output </span>
            </div>


            <div style={{ height: '80%', overflowY: 'scroll', color: '#FFFFFF', backgroundColor: '#000000', paddingLeft: '5px', paddingTop: '5px', fontSize: '14px' }}>
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default Output;
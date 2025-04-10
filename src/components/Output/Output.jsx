import React from 'react';

const Output = ({ output }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", width: '50%', padding: '10px' }}>
            <h2 style={{ marginBottom: "10px" }}>Output: </h2>
            <div style={{ border: '1px solid #ddd', height: '80%', overflowY: 'scroll', color: '#FFFFFF', backgroundColor: '#000000', paddingLeft: '20px', fontSize: '14px' }}>
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default Output;
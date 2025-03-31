import { React } from 'jimu-core'

const Results = (props) => {
    const message = props.message

    return (
        <div style={{ overflowY: 'auto', padding: '10px', border: '1px solid #ffffff' }}>
            {message ? message.map((div, index) => {
                const markup = { __html: div.innerHTML }
                // Check if the message content is empty
                if (!div.innerHTML.trim()) {
                    return null; // Skip rendering this popup if it's empty
                }
                
                return (
                    <div key={index} style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ffffff' }}>
                        {/* {div.children[0]?.children[0]?.innerText && (
                            <h3 style={{ marginBottom: '10px' }}>{div.children[0].children[0].innerText}</h3>
                        )} */}
                        <div dangerouslySetInnerHTML={markup}></div>
                    </div>
                )
            }) : <p>No results found.</p>}
        </div>
    )
}

export default Results
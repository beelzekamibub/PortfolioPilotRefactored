import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();
    const goback = () => navigate(-1);
    return (
        <section>
            <h1>Unauthorized</h1>
            <br />
            <p>You dont have acces to go to this page.</p>
            <div className="GoBackFlexGrow">
                <button onClick={goback}> Go Back </button>
            </div>
        </section>
    )
}

export default Unauthorized
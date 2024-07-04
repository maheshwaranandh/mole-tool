import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { FaDownload } from 'react-icons/fa';

function App() {
    const [formData, setFormData] = useState({
        location: '',
        moleculeName: '',
        sequence: '',
        numberOfCycles: '',
    });
    const [loading, setLoading] = useState(false);
    const [downloadLink, setDownloadLink] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setDownloadLink('');
        axios.post('/api/update-file', formData)
            .then(response => {
                setDownloadLink(`${process.env.REACT_APP_PUBLIC_URL}/download/results.zip`);
                setLoading(false);
            })
            .catch(error => {
                console.error('There was an error updating the file!', error);
                setLoading(false);
            });
    };

    return (
        <div className="App">
            <h1>Molecule Tool Form</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Location of Results Directory:</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        pattern="\S+"
                        required
                        placeholder="Enter location"
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label>Molecule Name:</label>
                    <input
                        type="text"
                        name="moleculeName"
                        value={formData.moleculeName}
                        onChange={handleChange}
                        pattern="\S+"
                        required
                        placeholder="Enter molecule name"
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label>Sequence:</label>
                    <input
                        type="text"
                        name="sequence"
                        value={formData.sequence}
                        onChange={(e) => handleChange({ target: { name: 'sequence', value: e.target.value.toUpperCase() } })}
                        required
                        placeholder="Enter sequence (uppercase)"
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label>Number of Cycles:</label>
                    <input
                        type="number"
                        name="numberOfCycles"
                        value={formData.numberOfCycles}
                        onChange={handleChange}
                        required
                        placeholder="Enter number of cycles"
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>Submit</button>
            </form>
            {loading && <p>Processing... Please wait.</p>}
            {downloadLink && (
                <div className="download-link">
                    <p>Download your results:</p>
                    <a href={downloadLink} download>
                        <FaDownload /> Download Results.zip
                    </a>
                </div>
            )}
        </div>
    );
}

export default App;

"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('aml'); // 'aml' or 'induction'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [schemas, setSchemas] = useState([]);
  const [branchMasterData, setBranchMasterData] = useState({});

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
         if (data.success) {
             setBranchMasterData(data.branches);
         }
      })
      .catch(err => console.error(err));

    fetch('/api/schemas')
      .then(res => res.json())
      .then(data => {
          if (data.success) setSchemas(data.schemas);
      })
      .catch(err => console.error(err));
  }, []);

  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === 'branchCode' && branchMasterData[value]) {
       const info = branchMasterData[value];
       newFormData.branchName = info.branchName || '';
       if (activeTab === 'aml') {
           newFormData.region = info.region || '';
       }
       
       setTimeout(() => {
         const nameInput = document.querySelector('input[name="branchName"]');
         if (nameInput) nameInput.value = info.branchName || '';

         if (activeTab === 'aml') {
             const regionInput = document.querySelector('input[name="region"]');
             if (regionInput) regionInput.value = info.region || '';
         }
       }, 0);
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: activeTab, ...formData }),
      });

      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        setFormData({});
        e.target.reset();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Data Entry Portal</h1>
        <p className="subtitle">Please select a category and enter details</p>

        <div className="tabs" style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <div 
            className={`tab ${activeTab === 'aml' ? 'active' : ''}`}
            onClick={() => { setActiveTab('aml'); setFormData({}); setSuccess(false); setError(''); }}
          >
            AML Training
          </div>
          <div 
            className={`tab ${activeTab === 'induction' ? 'active' : ''}`}
            onClick={() => { setActiveTab('induction'); setFormData({}); setSuccess(false); setError(''); }}
          >
            Induction Program
          </div>
          {schemas.map(s => (
            <div 
              key={s.id}
              className={`tab ${activeTab === s.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(s.id); setFormData({}); setSuccess(false); setError(''); }}
            >
              {s.title}
            </div>
          ))}
        </div>

        {success && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Data submitted successfully!</div>}
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {activeTab === 'aml' && (
            <>
              <div className="form-group">
                <label>Branch Code</label>
                <input type="text" name="branchCode" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Region</label>
                <input type="text" name="region" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Branch Name</label>
                <input type="text" name="branchName" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Conventional / TAQWA</label>
                <select name="conventionalTaqwa" className="form-control" required onChange={handleChange} defaultValue="">
                  <option value="" disabled>Select option</option>
                  <option value="Conventional">Conventional</option>
                  <option value="TAQWA">TAQWA</option>
                </select>
              </div>
              <div className="form-group">
                <label>Emp Id</label>
                <input type="text" name="empId" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Staff Name</label>
                <input type="text" name="staffName" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input type="text" name="designation" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>AML Training Status</label>
                <select name="amlTrainingStatus" className="form-control" required onChange={handleChange} defaultValue="">
                  <option value="" disabled>Select option</option>
                  <option value="Trained">Trained</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="form-group">
                <label>SQO</label>
                <input type="text" name="sqo" className="form-control" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Activity Conducting Month</label>
                <input type="month" name="activityConductingMonth" className="form-control" required onChange={handleChange} />
              </div>
           </> )}
           {activeTab === 'induction' && (
            <>
              <div className="form-group">
                <label>Branch Code</label>
                <input type="text" name="branchCode" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Branch Name</label>
                <input type="text" name="branchName" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Emp Id</label>
                <input type="text" name="empId" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Staff Name</label>
                <input type="text" name="staffName" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input type="text" name="designation" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Induction Status (Yes / No)</label>
                <select name="inductionStatus" className="form-control" required onChange={handleChange} defaultValue="">
                  <option value="" disabled>Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <input type="date" name="joiningDate" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>SQO</label>
                <input type="text" name="sqo" className="form-control" onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Activity Conducting Month</label>
                <input type="month" name="activityConductingMonth" className="form-control" required onChange={handleChange} />
              </div>
            </>
          )}

          {schemas.map(schema => (
            activeTab === schema.id && (
              <div key={schema.id}>
                {schema.fields.map(field => (
                  <div className="form-group" key={field.name}>
                    <label>{field.label}</label>
                    <input 
                      type={field.type || 'text'} 
                      name={field.name} 
                      className="form-control" 
                      required 
                      onChange={handleChange} 
                    />
                  </div>
                ))}
              </div>
            )
          ))}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}

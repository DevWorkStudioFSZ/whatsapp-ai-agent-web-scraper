"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [data, setData] = useState({ aml: [], induction: [], branches: [] });
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('aml');
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editForm, setEditForm] = useState({ branchName: '', region: '' });
  const router = useRouter();

  useEffect(() => {
    // Check auth
    if (localStorage.getItem('isAdmin') !== 'true') {
      router.push('/login');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const result = await res.json();

      const sRes = await fetch('/api/schemas');
      const sResult = await sRes.json();
      if (sResult.success) setSchemas(sResult.schemas);

      const bRes = await fetch('/api/branches');
      const bResult = await bRes.json();
      const branchesArr = bResult.success ? Object.keys(bResult.branches).map(k => {
          const codeStr = String(k);
          return { 
              code: k, 
              ...bResult.branches[k],
              amlCount: result.data.aml.filter(x => String(x.branchCode) === codeStr).length,
              inductionCount: result.data.induction.filter(x => String(x.branchCode) === codeStr).length
          }
      }) : [];

      if (result.success) {
        setData({ ...result.data, branches: branchesArr });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !newCategoryName) return alert('Please provide name and file');
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', newCategoryName);

    try {
      const res = await fetch('/api/upload-sheet', { method: 'POST', body: formData });
      const resData = await res.json();
      if (resData.success) {
        alert('Category added successfully!');
        setNewCategoryName('');
        setSelectedFile(null);
        fetchData();
        setActiveTab('aml');
      } else {
        alert(resData.error || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/login');
  };

  const startEdit = (row) => {
    setEditingBranch(row.code);
    setEditForm({ branchName: row.branchName, region: row.region });
  };

  const saveEdit = async (code) => {
    try {
      const resp = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', code, ...editForm })
      });
      if (resp.ok) {
        setEditingBranch(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    window.location.href = '/api/export';
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading Dashboard...</div>;

  return (
    <div className="admin-container">
      <div className="navbar">
        <h1 className="title" style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={handleDownload} style={{ width: 'auto', backgroundColor: '#10b981' }}>
            Download Excel
          </button>
          <button className="btn" onClick={handleLogout} style={{ width: 'auto', backgroundColor: '#ef4444' }}>
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <div className="tabs" style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <div 
            className={`tab ${activeTab === 'aml' ? 'active' : ''}`}
            onClick={() => setActiveTab('aml')}
          >
            AML Training ({data.aml.length})
          </div>
          <div 
            className={`tab ${activeTab === 'induction' ? 'active' : ''}`}
            onClick={() => setActiveTab('induction')}
          >
            Induction Program ({data.induction.length})
          </div>
          {schemas.map(s => (
            <div 
                key={s.id}
                className={`tab ${activeTab === s.id ? 'active' : ''}`}
                onClick={() => setActiveTab(s.id)}
            >
                {s.title} ({data[s.id] ? data[s.id].length : 0})
            </div>
          ))}
          <div 
            className={`tab ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveTab('branches')}
          >
            Branch Details ({data.branches ? data.branches.length : 0})
          </div>
          <div 
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
            style={{ backgroundColor: '#6366f1', color: 'white' }}
          >
            + New Category
          </div>
        </div>

        <div className="table-responsive">
          {activeTab === 'upload' && (
            <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
              <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Upload Excel to Create Category</h2>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem', textAlign: 'center' }}>
                Excel ki pehli row headers nikaali jayengi aur wahi form fields banengi.
              </p>
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label>Category Name (e.g. Health & Safety)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Select Excel File</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept=".xlsx, .xls"
                    onChange={e => setSelectedFile(e.target.files[0])}
                    required
                  />
                </div>
                <button className="btn" type="submit" disabled={uploading} style={{ backgroundColor: '#6366f1' }}>
                  {uploading ? 'Processing...' : 'Create Category'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'aml' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Branch Code</th>
                  <th>Region</th>
                  <th>Branch Name</th>
                  <th>Conv / TAQWA</th>
                  <th>Emp Id</th>
                  <th>Staff Name</th>
                  <th>Status</th>
                  <th>SQO</th>
                  <th>Month</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.aml.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.branchCode}</td>
                    <td>{row.region}</td>
                    <td>{row.branchName}</td>
                    <td>{row.conventionalTaqwa}</td>
                    <td>{row.empId}</td>
                    <td>{row.staffName}</td>
                    <td>{row.amlTrainingStatus}</td>
                    <td>{row.sqo}</td>
                    <td>{row.activityConductingMonth}</td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.aml.length === 0 && (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '2rem' }}>No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'induction' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Branch Code</th>
                  <th>Branch Name</th>
                  <th>Emp Id</th>
                  <th>Staff Name</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th>Joining Date</th>
                  <th>SQO</th>
                  <th>Month</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.induction.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.branchCode}</td>
                    <td>{row.branchName}</td>
                    <td>{row.empId}</td>
                    <td>{row.staffName}</td>
                    <td>{row.designation}</td>
                    <td>{row.inductionStatus}</td>
                    <td>{row.joiningDate}</td>
                    <td>{row.sqo}</td>
                    <td>{row.activityConductingMonth}</td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.induction.length === 0 && (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '2rem' }}>No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {schemas.map(schema => (
            activeTab === schema.id && (
                <table key={schema.id}>
                    <thead>
                        <tr>
                            {schema.fields.map(f => <th key={f.name}>{f.label}</th>)}
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data[schema.id] || []).map((row, idx) => (
                            <tr key={idx}>
                                {schema.fields.map(f => <td key={f.name}>{row[f.name]}</td>)}
                                <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {(!data[schema.id] || data[schema.id].length === 0) && (
                            <tr>
                                <td colSpan={schema.fields.length + 1} style={{ textAlign: 'center', padding: '2rem' }}>No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )
          ))}

          {activeTab === 'branches' && (
            <table>
              <thead>
                <tr>
                  <th>Branch Code</th>
                  <th>Branch Name</th>
                  <th>Region</th>
                  <th>AML Entries</th>
                  <th>Induction Entries</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.branches && data.branches.map((row) => (
                  <tr key={row.code}>
                    <td>{row.code}</td>
                    <td>
                      {editingBranch === row.code ? (
                        <input type="text" value={editForm.branchName} onChange={e => setEditForm({...editForm, branchName: e.target.value})} className="form-control" style={{marginBottom: 0}} />
                      ) : row.branchName}
                    </td>
                    <td>
                      {editingBranch === row.code ? (
                        <input type="text" value={editForm.region} onChange={e => setEditForm({...editForm, region: e.target.value})} className="form-control" style={{marginBottom: 0}} />
                      ) : row.region}
                    </td>
                    <td><span style={{ fontWeight: 'bold' }}>{row.amlCount}</span></td>
                    <td><span style={{ fontWeight: 'bold' }}>{row.inductionCount}</span></td>
                    <td>
                      {editingBranch === row.code ? (
                        <div style={{display: 'flex', gap: '4px'}}>
                          <button onClick={() => saveEdit(row.code)} className="btn" style={{padding: '4px 8px', width: 'auto', backgroundColor: '#10b981', minWidth: '0'}}>Save</button>
                          <button onClick={() => setEditingBranch(null)} className="btn" style={{padding: '4px 8px', width: 'auto', backgroundColor: '#ef4444', minWidth: '0'}}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(row)} className="btn" style={{padding: '4px 8px', width: 'auto', minWidth: '0'}}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!data.branches || data.branches.length === 0) && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

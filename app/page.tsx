"use client";
"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';

const EsmApp = () => {
  const [sequence, setSequence] = useState("KVFGRCELAAAMKRHGLDNYRGYSLGNWVCAAKFESNFNTQATNRNTDGSTDYGILQINSRWWCNDGRTPGSRNLCNIPCSALLSSDITASVNCAKKIVSDGNGMNAWVAWRNRCKGTDVQAWIRGCRL");
  const [pdbData, setPdbData] = useState(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (pdbData && viewerRef.current) {
      import('3dmol').then($3Dmol => {
        const viewer = $3Dmol.createViewer(viewerRef.current);
        viewer.addModel(pdbData, 'pdb');
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        viewer.zoomTo();
        viewer.animate({ loop: 'forward', reps: 1 });
        viewer.render();
        const blob = new Blob([pdbData], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        setDownloadLink(url);
      });
    }
  }, [pdbData]);

  const update = async () => {
    try {
      const response = await axios.post('https://api.esmatlas.com/foldSequence/v1/pdb/', sequence);
      const pdbString = response.data;
      setPdbData(pdbString);
      setDownloadLink(null); 
    } catch (error) {
      console.error("Error predicting protein structure:", error);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([pdbData || ''], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'protein_structure.pdb';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-3">
          <h1>ESM App</h1>
          <p>
            This is a simple app that uses <a href="https://esmatlas.com/">ESM</a> to predict the structure of a protein sequence.
          </p>
          <textarea
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            style={{ width: '100%', height: '200px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="contained" color="primary" onClick={update}>
              Submit
            </Button>
            {downloadLink && (
              <Button variant="contained" color="secondary" onClick={handleDownload}>
                Download PDB
              </Button>
            )}
          </div>
        </div>
        <div className="col-9">
          <div ref={viewerRef} style={{ height: '500px', position: 'relative' }}></div>
        </div>
      </div>
    </div>
  );
};

export default EsmApp;

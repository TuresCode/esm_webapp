"use client";
"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import JSZip from 'jszip';

const EsmApp = () => {
  const [sequence, setSequence] = useState("MKVFGRCELAAAMKRHGLDNYRGYSLGNWVCAAKFESTDYGILQINSRWWCNDGRTPGSRNLCNIPCSALLSSDITASVNCAKKIVSDGNGMNAWVAWRNRCKGTDVQAWIRGCRL");
  const [pdbData, setPdbData] = useState(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [predictedCount, setPredictedCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [total_sequences, setTotalSequences] = useState(0);
  

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  useEffect(() => {
    if (pdbData && viewerRef.current) {
      import('3dmol').then($3Dmol => {
        const viewer = $3Dmol.createViewer(viewerRef.current);
        viewer.addModel(pdbData, 'pdb');
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        viewer.zoomTo();
        viewer.animate({ loop: 'backAndForth', reps: 0 });
        viewer.render();
        const blob = new Blob([pdbData], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        setDownloadLink(url);
      });
    }
  }, [pdbData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {

    setLoading(true);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target as FileReader).result;

        // Assuming the content of the file is a multi-FASTA format
        if (content) {
          // loop through each FASTA entry by using api and save it in a new text file
          const sequences = (content as string).split('>');
          // remove /r and /n and * from the sequences
          const names: string[] = [];
          // get names by splitting by /n
          for (let i = 0; i < sequences.length; i++) {
            names[i] = sequences[i].split('\n')[0];
            sequences[i] = sequences[i].split('\n').slice(1).join('\n');
          }
          //remove first empty element in sequences and names
          sequences.shift();
          names.shift();

          for (let i = 0; i < sequences.length; i++) {
            names[i] = names[i].replace(/\r?\n|\r/g, '');
            sequences[i] = sequences[i].replace(/\r?\n|\r/g, '');
            sequences[i] = sequences[i].replace(/\*/g, ''); // if stop codon is present
          }

          // now we have sequences and names and can loop through them using the api and save them all together as zip file
          generateZipFile(sequences, names);
          
        }
      };
      reader.readAsText(file);
    }
  };

  const generateZipFile = async (sequences: string[], names: string[]) => {
    const zip = new JSZip();
    setTotalSequences(sequences.length);
    for (let i = 0; i < sequences.length; i++) {
      try {
        const response = await axios.post('https://api.esmatlas.com/foldSequence/v1/pdb/', sequences[i]);
        const pdbString = response.data;
        zip.file(`${names[i]}.pdb`, pdbString);
        console.log(`Predicted protein structure for sequence ${names[i]}`);
        setPredictedCount(prevCount => prevCount + 1); // increment the count
        setSnackbarOpen(true); // open the snackbar
      } catch (error) {
        console.error(`Error predicting protein structure for sequence ${names[i]}:`, error);
      }
    }
    setLoading(false);
    const content = await zip.generateAsync({type:"blob"});
    const url = URL.createObjectURL(content);
    setDownloadLink(url);
  };

  const update = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://api.esmatlas.com/foldSequence/v1/pdb/', sequence);
      const pdbString = response.data;
      setPdbData(pdbString);
      setDownloadLink(null); 
    } catch (error) {
      console.error("Error predicting protein structure:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    if (pdbData) {
      const file = new Blob([pdbData], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'protein_structure.pdb';
    } else if (downloadLink) {
      element.href = downloadLink;
      element.download = 'sequences.zip';
    }
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
          <p> Either paste a protein sequence below or upload a Multi-FASTA file.</p>
          <textarea
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            style={{ width: '100%', height: '100px' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <LoadingButton variant="contained" loading={loading} color="primary" onClick={update}>
              Submit
            </LoadingButton>

            {downloadLink && (
              <Button variant="contained" color="secondary" onClick={handleDownload}>
                Download PDB
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'left', marginTop: '5px', marginBottom: '5px' }}>
            <LoadingButton variant="contained" loading={loading} component="label" color="primary" startIcon={<CloudUploadIcon />}>
              Upload FASTA
              <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
            </LoadingButton>
          </div>
          <div>
            <Snackbar open={snackbarOpen} autoHideDuration={10000} onClose={() => setSnackbarOpen(false)}>
              <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                {predictedCount} sequences of {total_sequences} have been predicted!
              </Alert>
            </Snackbar>
          </div>

          <div style={{ position: 'absolute', right: '10px', bottom: '10px' }}>
            © {new Date().getFullYear()} by TuresCode
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

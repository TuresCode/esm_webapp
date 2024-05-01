# ESM Protein Structure Prediction App

This application uses the ESM (Evolutionary Scale Modeling) API to predict the structure of protein sequences. It allows users to input a single protein sequence or upload a Multi-FASTA file containing multiple sequences. The predicted structures are then downloadable as PDB files.

The application can be accessed at: [https://esm-webapp.vercel.app/](https://esm-webapp.vercel.app/)

## 🚀 Features

- Predict the structure of a single protein sequence
- Predict the structure of multiple protein sequences from a Multi-FASTA file
- Download the predicted structures as PDB files
- View the progress of the prediction process

## 📖 How to Use

1. To predict the structure of a single protein sequence, paste the sequence into the text area and click the "Submit" button.
2. To predict the structure of multiple protein sequences, click the "Upload FASTA" button and select a Multi-FASTA file from your computer.
3. Once the prediction process is complete, click the "Download PDB" button to download the predicted structures as a PDB file.

## 🛠️ Technologies Used

- React
- TypeScript
- Material-UI
- axios
- JSZip

import { useEffect, useState } from "react";

const Instruction = () => {

    const [pdfs, setPdfs] = useState([]);

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const response = await fetch("/api/storage/get-storage");
                const data = await response.json();
                console.log(data.pdfs);
                setPdfs(data.pdfs);
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchPdfs();
    }, []);

    return (
        <div>
            <h1>Instruction</h1>
            <div>
                {pdfs.map((pdf, index) => (
                    <div key={index}>
                        <iframe src={pdf} width="100%" height="600px" title="PDF Viewer"></iframe>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default Instruction;
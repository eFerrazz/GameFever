import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { FileWithPath } from "react-dropzone";
import { Button } from "../ui/button";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl?: string;
};

const FileUploader = ({ fieldChange, mediaUrl = "" }: FileUploaderProps) => {
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const [err, setErr] = useState<string>("");

  const onDrop = useCallback(
  (accepted: FileWithPath[], rejected: any[]) => {
    if (!accepted.length) {
      setErr("Arquivo não aceito. Use PNG, JPG, JPEG, SVG ou WEBP.");
      return;
    }
    setErr("");

    const f = accepted[0];
    const url = URL.createObjectURL(f);

    setFileUrl(url);        // só para preview
    fieldChange([f]);       // envia o File real para o form
  },
  [fieldChange]
);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".svg", ".webp"] },
  });

  useEffect(() => {
    return () => {
      if (fileUrl?.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  return (
    <div
      {
        ...getRootProps()}
      className="flex flex-col items-center justify-center bg-dark-3 rounded-lg cursor-pointer p-6"
    >
      <input {...getInputProps()} className="cursor-pointer" />

      {
      fileUrl ? (
        <>
        <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
          <img
            src={fileUrl}
            alt="imagem"
            className="file_uploader-img"
          />
        </div>
          <p className="file_uploader-label">Clique ou arraste uma foto para substituir</p>
        </>
      ) : (
        <div className="file_uploader-box">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file-upload"
          />
          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Arraste foto aqui
          </h3>
          <p className="text-light-4 small-regular mb-6">PNG, JPG, SVG, WEBP</p>
          <Button type="button" className="shad-button_dark_4">
            Selecionar do computador
          </Button>
        </div>
      )}

      {isDragActive && (
        <p className="text-light-2 text-sm mt-2">Solte a imagem…</p>
      )}
      {!!err && <p className="text-red-400 text-sm mt-2">{err}</p>}
    </div>
  );
};

export default FileUploader;
